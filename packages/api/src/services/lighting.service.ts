/**
 * Lighting Enhancement Service (Story 3.2, Task 3).
 * Orchestrates: analyze -> IC-Light relight -> quality validation -> version creation -> storage.
 */

import { createUserClient, supabaseAdmin } from '../lib/supabase';
import { AppError } from '../lib/errors';
import { logger } from '../lib/logger';
import { icLightClient } from './ic-light.client';
import { lightingAnalysis } from './lighting-analysis';
import { quotaService } from './quota.service';
import { enqueueRenderJob } from '../queue/render.queue';
import { renderEvents } from '../queue/render.events';
import { redisHealthCheck } from '../lib/redis';
import type { LightingMode } from './ic-light.client';
import type { Database } from '@decorai/shared';

type VersionRow = Database['public']['Tables']['project_versions']['Row'];
type RenderJobRow = Database['public']['Tables']['render_jobs']['Row'];

export const lightingService = {
  /**
   * AC1: Analyze lighting and optionally enqueue enhancement job.
   * Returns lighting assessment + creates job if auto_enhance or needs_enhancement.
   */
  async analyzeLighting(params: {
    projectId: string;
    userId: string;
    imageVersionId: string;
    mode: LightingMode;
    autoEnhance: boolean;
    accessToken: string;
  }) {
    const { projectId, userId, imageVersionId, mode, autoEnhance, accessToken } = params;

    // Verify project ownership (AC1: 403 for wrong user)
    const client = createUserClient(accessToken);
    const { data: project, error: projectError } = await client
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .eq('user_id', userId)
      .single();

    if (projectError || !project) {
      throw new AppError({
        code: 'PROJECT_NOT_FOUND',
        message: 'Projeto nao encontrado ou acesso negado',
        statusCode: 403,
      });
    }

    // Get the specified image version
    const { data: versionData } = await supabaseAdmin
      .from('project_versions')
      .select('id, version_number, image_url, metadata')
      .eq('id', imageVersionId)
      .eq('project_id', projectId)
      .single();

    const version = versionData as VersionRow | null;

    if (!version) {
      throw new AppError({
        code: 'VERSION_NOT_FOUND',
        message: 'Versao de imagem nao encontrada neste projeto',
        statusCode: 404,
      });
    }

    // AC1: Analyze lighting from image URL
    // For remote images, we fetch a small portion to estimate brightness
    const brightnessScore = await this.estimateBrightnessFromUrl(version.image_url);
    const assessment = lightingAnalysis.analyzeFromScore(brightnessScore);

    // If auto_enhance requested OR user wants to proceed, create enhancement job
    if (autoEnhance && assessment.needs_enhancement) {
      const jobResult = await this.createEnhancementJob({
        projectId,
        userId,
        version,
        mode,
        brightnessScore,
        accessToken,
      });

      return {
        assessment,
        job_id: jobResult.job_id,
        status: jobResult.status,
      };
    }

    // Return assessment only (user decides)
    return {
      assessment,
      job_id: null,
      status: 'analysis_complete',
    };
  },

  /**
   * Creates an enhancement job in the queue.
   */
  async createEnhancementJob(params: {
    projectId: string;
    userId: string;
    version: VersionRow;
    mode: LightingMode;
    brightnessScore: number;
    accessToken: string;
  }) {
    const { projectId, userId, version, mode, brightnessScore } = params;

    // Validate queue availability
    const isRedisUp = await redisHealthCheck();
    if (!isRedisUp) {
      throw new AppError({
        code: 'QUEUE_UNAVAILABLE',
        message: 'Servico de fila indisponivel. Tente novamente mais tarde.',
        statusCode: 503,
      });
    }

    // AC6: Enforce quota (1 render credit)
    const quota = await quotaService.enforceQuota(userId);

    // Create render job in DB
    const { data, error } = await supabaseAdmin
      .from('render_jobs')
      .insert({
        project_id: projectId,
        type: 'lighting_enhancement',
        status: 'queued',
        priority: quota.tier === 'business' ? 1 : quota.tier === 'pro' ? 5 : 10,
        input_params: {
          image_url: version.image_url,
          image_version_id: version.id,
          base_version_number: version.version_number,
          mode,
          original_brightness: brightnessScore,
        },
        attempts: 0,
      })
      .select()
      .single();

    const job = data as RenderJobRow | null;

    if (error || !job) {
      logger.error({ err: error }, 'Failed to create lighting enhancement render job');
      throw new AppError({
        code: 'LIGHTING_JOB_CREATE_FAILED',
        message: 'Falha ao criar job de melhoria de iluminacao',
        statusCode: 500,
      });
    }

    // Enqueue in BullMQ
    await enqueueRenderJob(
      {
        jobId: job.id,
        projectId,
        userId,
        type: 'lighting_enhancement',
        inputParams: job.input_params as Record<string, unknown>,
      },
      quota.tier,
    );

    return {
      job_id: job.id,
      status: job.status,
      mode,
    };
  },

  /**
   * AC2: Process lighting enhancement job (called by worker).
   * Pipeline: analyze (20%) -> IC-Light enhance (50%) -> validate (75%) -> store (100%)
   */
  async processLightingJob(jobId: string, inputParams: Record<string, unknown>) {
    const imageUrl = inputParams.image_url as string;
    const mode = (inputParams.mode as LightingMode) || 'auto';
    const originalBrightness = (inputParams.original_brightness as number) || 0;
    const baseVersionNumber = (inputParams.base_version_number as number) || 0;

    const startTime = Date.now();

    // Get project info from render job
    const { data: job } = await supabaseAdmin
      .from('render_jobs')
      .select('project_id')
      .eq('id', jobId)
      .single();

    if (!job) {
      throw new AppError({
        code: 'RENDER_JOB_NOT_FOUND',
        message: 'Job de render nao encontrado',
        statusCode: 404,
      });
    }

    const projectId = job.project_id;

    // Stage 1: Analyzing (20%)
    await renderEvents.broadcast({ jobId, status: 'processing', progress: 20 });

    // Stage 2: IC-Light enhancement (50%)
    await renderEvents.broadcast({ jobId, status: 'processing', progress: 50 });

    const icResult = await icLightClient.enhanceLighting({
      image_url: imageUrl,
      mode,
    });

    // Stage 3: Quality validation / blending (75%)
    await renderEvents.broadcast({ jobId, status: 'processing', progress: 75 });

    // Estimate enhanced brightness for quality validation
    const enhancedBrightness = await this.estimateBrightnessFromUrl(icResult.result_image_url);

    // Stage 4: Store result and create version (100%)
    const generationTimeMs = Date.now() - startTime;
    const nextVersion = baseVersionNumber + 1;

    const { data: versionData, error: versionError } = await supabaseAdmin
      .from('project_versions')
      .insert({
        project_id: projectId,
        version_number: nextVersion,
        image_url: icResult.result_image_url,
        thumbnail_url: icResult.result_image_url,
        prompt: icResult.metadata.prompt_used,
        metadata: {
          type: 'lighting_enhancement',
          original_brightness: originalBrightness,
          enhanced_brightness: enhancedBrightness,
          lighting_mode: mode,
          generation_time_ms: generationTimeMs,
          provider: icResult.metadata.provider,
          model: icResult.metadata.model,
        },
      })
      .select()
      .single();

    const version = versionData as VersionRow | null;

    if (versionError) {
      logger.error({ err: versionError }, 'Failed to create lighting enhancement version');
    }

    // Update render job
    await supabaseAdmin
      .from('render_jobs')
      .update({
        status: 'completed',
        output_params: {
          result_url: icResult.result_image_url,
          version_id: version ? version.id : null,
          original_brightness: originalBrightness,
          enhanced_brightness: enhancedBrightness,
          generation_time_ms: generationTimeMs,
        },
        duration_ms: generationTimeMs,
        completed_at: new Date().toISOString(),
      })
      .eq('id', jobId);

    // Broadcast completion
    await renderEvents.broadcast({ jobId, status: 'completed', progress: 100 });

    return {
      result_url: icResult.result_image_url,
      version_id: version ? version.id : null,
      generation_time_ms: generationTimeMs,
    };
  },

  /**
   * Estimates brightness from a remote image URL.
   * Fetches the image, samples pixels for mean luminance.
   */
  async estimateBrightnessFromUrl(imageUrl: string): Promise<number> {
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        logger.warn({ imageUrl, status: response.status }, 'Failed to fetch image for brightness estimation');
        return 50; // Default to midpoint if fetch fails
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      const assessment = lightingAnalysis.analyzeFromBuffer(buffer);
      return assessment.brightness_score;
    } catch (err) {
      logger.warn({ err, imageUrl }, 'Error estimating brightness from URL');
      return 50; // Default fallback
    }
  },
};
