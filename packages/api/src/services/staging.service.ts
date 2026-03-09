import { createUserClient, supabaseAdmin } from '../lib/supabase';
import { AppError } from '../lib/errors';
import { logger } from '../lib/logger';
import { aiPipelineClient } from '../lib/ai-pipeline.client';
import { quotaService } from './quota.service';
import { storageService } from './storage.service';
import { stylesRegistry } from './staging-styles.registry';
import { enqueueRenderJob } from '../queue/render.queue';
import { renderEvents } from '../queue/render.events';
import { redisHealthCheck } from '../lib/redis';
import { lightingAnalysis } from './lighting-analysis';
import type { DecorStyle, SubscriptionTier, Database } from '@decorai/shared';

type RenderJobRow = Database['public']['Tables']['render_jobs']['Row'];
type VersionRow = Database['public']['Tables']['project_versions']['Row'];

const TIER_RESOLUTION: Record<SubscriptionTier, '1024x1024' | '2048x2048'> = {
  free: '1024x1024',
  pro: '2048x2048',
  business: '2048x2048',
};

function computePhotoHash(buffer: Buffer): string {
  let hash = 0;
  for (let i = 0; i < buffer.length; i += 100) {
    hash = ((hash << 5) - hash + buffer[i]) | 0;
  }
  return Math.abs(hash).toString(36);
}

export const stagingService = {
  async generate(params: {
    projectId: string;
    userId: string;
    styleId: DecorStyle;
    fileBuffer: Buffer;
    fileMimeType: string;
    accessToken: string;
  }) {
    const { projectId, userId, styleId, fileBuffer, fileMimeType, accessToken } = params;

    // Validate queue availability
    const isRedisUp = await redisHealthCheck();
    if (!isRedisUp) {
      throw new AppError({
        code: 'QUEUE_UNAVAILABLE',
        message: 'Servico de fila indisponivel. Tente novamente mais tarde.',
        statusCode: 503,
      });
    }

    // Verify project ownership
    const client = createUserClient(accessToken);
    const { data: project, error: projectError } = await client
      .from('projects')
      .select('id, original_image_url')
      .eq('id', projectId)
      .eq('user_id', userId)
      .single();

    if (projectError || !project) {
      throw new AppError({
        code: 'PROJECT_NOT_FOUND',
        message: 'Projeto nao encontrado',
        statusCode: 404,
      });
    }

    // Validate style
    const style = stylesRegistry.getById(styleId);
    if (!style) {
      throw new AppError({
        code: 'INVALID_STYLE',
        message: 'Estilo de decoracao invalido',
        statusCode: 400,
      });
    }

    // Validate file
    storageService.validateFile(fileBuffer, fileMimeType);

    // Enforce quota
    const quota = await quotaService.enforceQuota(userId);
    const resolution = TIER_RESOLUTION[quota.tier];

    // Upload photo to storage
    const uploadResult = await storageService.upload(fileBuffer, fileMimeType, userId, projectId);

    // Compute photo hash for depth map caching
    const photoHash = computePhotoHash(fileBuffer);

    // AC4 (Story 3.2): Analyze brightness for lighting suggestion
    const lightingAssessment = lightingAnalysis.analyzeFromBuffer(fileBuffer);

    // Create render job in DB
    const { data, error } = await supabaseAdmin
      .from('render_jobs')
      .insert({
        project_id: projectId,
        type: 'initial',
        status: 'queued',
        priority: quota.tier === 'business' ? 1 : quota.tier === 'pro' ? 5 : 10,
        input_params: {
          style_id: styleId,
          photo_url: uploadResult.image_url,
          photo_hash: photoHash,
          resolution,
          prompt_modifier: style.prompt_modifier,
          negative_prompt: style.negative_prompt,
        },
        attempts: 0,
      })
      .select()
      .single();

    const job = data as RenderJobRow | null;

    if (error || !job) {
      logger.error({ err: error }, 'Failed to create staging render job');
      throw new AppError({
        code: 'STAGING_JOB_CREATE_FAILED',
        message: 'Falha ao criar job de staging',
        statusCode: 500,
      });
    }

    // Enqueue in BullMQ
    await enqueueRenderJob(
      {
        jobId: job.id,
        projectId,
        userId,
        type: 'initial',
        inputParams: job.input_params as Record<string, unknown>,
      },
      quota.tier,
    );

    // AC4 (Story 3.2): Include lighting suggestion if severely underexposed
    const lightingSuggestion = lightingAssessment.brightness_score < 40
      ? {
        needs_enhancement: true,
        brightness_score: lightingAssessment.brightness_score,
        recommended_mode: 'auto' as const,
        message: 'Sua foto parece estar escura. Recomendamos melhorar a iluminacao antes de gerar o staging para melhores resultados.',
      }
      : undefined;

    return {
      job_id: job.id,
      status: job.status,
      style_id: styleId,
      resolution,
      lighting_suggestion: lightingSuggestion,
    };
  },

  async processJob(jobId: string, inputParams: Record<string, unknown>) {
    const photoUrl = inputParams.photo_url as string;
    const styleId = inputParams.style_id as DecorStyle;
    const photoHash = inputParams.photo_hash as string;
    const resolution = (inputParams.resolution as '1024x1024' | '2048x2048') || '1024x1024';
    const promptModifier = inputParams.prompt_modifier as string;
    const negativePrompt = inputParams.negative_prompt as string;
    const existingDepthMapUrl = inputParams.depth_map_url as string | undefined;

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

    // Stage 1: Depth estimation (25%)
    let depthMapUrl: string;
    if (existingDepthMapUrl) {
      depthMapUrl = existingDepthMapUrl;
    } else {
      depthMapUrl = await this.getOrCreateDepthMap(photoUrl, photoHash, projectId);
    }

    await renderEvents.broadcast({
      jobId,
      status: 'processing',
      progress: 25,
    });

    // Stage 2: Style extraction / ControlNet conditioning (50%)
    const styleResult = await aiPipelineClient.analyzeStyle(styleId);

    await renderEvents.broadcast({
      jobId,
      status: 'processing',
      progress: 50,
    });

    // Stage 3: SDXL generation (75%)
    const genResult = await aiPipelineClient.generate({
      sourceImageUrl: photoUrl,
      depthMapUrl,
      styleParams: {
        style_prompt: promptModifier,
        negative_prompt: negativePrompt,
        ...styleResult.controlnet_params,
      },
      outputResolution: resolution,
    });

    await renderEvents.broadcast({
      jobId,
      status: 'processing',
      progress: 75,
    });

    // Stage 4: Store result and create version (100%)
    const generationTimeMs = Date.now() - startTime;

    // Get next version number
    const { data: latestVersions } = await supabaseAdmin
      .from('project_versions')
      .select('version_number')
      .eq('project_id', projectId)
      .order('version_number', { ascending: false })
      .limit(1);

    const versionRows = latestVersions as Array<{ version_number: number }> | null;
    const nextVersion = (versionRows && versionRows.length > 0)
      ? versionRows[0].version_number + 1
      : 1;

    // Create version
    const { data, error: versionError } = await supabaseAdmin
      .from('project_versions')
      .insert({
        project_id: projectId,
        version_number: nextVersion,
        image_url: genResult.result_image_url,
        thumbnail_url: genResult.result_image_url,
        prompt: promptModifier,
        metadata: {
          style_id: styleId,
          resolution,
          generation_time_ms: generationTimeMs,
          depth_map_url: depthMapUrl,
          photo_hash: photoHash,
          provider: genResult.metadata.provider,
          model: genResult.metadata.model,
        },
      })
      .select()
      .single();

    const version = data as VersionRow | null;

    if (versionError) {
      logger.error({ err: versionError }, 'Failed to create project version');
    }

    // Update render job with completion
    await supabaseAdmin
      .from('render_jobs')
      .update({
        status: 'completed',
        output_params: {
          result_url: genResult.result_image_url,
          depth_map_url: depthMapUrl,
          version_id: version ? version.id : null,
          generation_time_ms: generationTimeMs,
        },
        duration_ms: generationTimeMs,
        completed_at: new Date().toISOString(),
      })
      .eq('id', jobId);

    // Broadcast completion (100%)
    await renderEvents.broadcast({
      jobId,
      status: 'completed',
      progress: 100,
    });

    return {
      result_url: genResult.result_image_url,
      version_id: version ? version.id : null,
      generation_time_ms: generationTimeMs,
    };
  },

  async getOrCreateDepthMap(
    photoUrl: string,
    photoHash: string,
    projectId: string,
  ): Promise<string> {
    // Check cache: look for existing depth map with this photo hash
    const cachePath = `depth-maps/${projectId}/${photoHash}.png`;
    const { data: existingFile } = await supabaseAdmin.storage
      .from('project-images')
      .createSignedUrl(cachePath, 3600);

    if (existingFile?.signedUrl) {
      logger.info({ photoHash, projectId }, 'Depth map cache hit');
      return existingFile.signedUrl;
    }

    // Cache miss: generate depth map
    logger.info({ photoHash, projectId }, 'Depth map cache miss, generating');
    const depthResult = await aiPipelineClient.analyzeDepth(photoUrl);

    return depthResult.depth_map_url;
  },

  async variation(params: {
    projectId: string;
    userId: string;
    styleId: DecorStyle;
    accessToken: string;
  }) {
    const { projectId, userId, styleId, accessToken } = params;

    // Validate queue availability
    const isRedisUp = await redisHealthCheck();
    if (!isRedisUp) {
      throw new AppError({
        code: 'QUEUE_UNAVAILABLE',
        message: 'Servico de fila indisponivel. Tente novamente mais tarde.',
        statusCode: 503,
      });
    }

    // Verify project ownership
    const client = createUserClient(accessToken);
    const { data: project, error: projectError } = await client
      .from('projects')
      .select('id, original_image_url')
      .eq('id', projectId)
      .eq('user_id', userId)
      .single();

    if (projectError || !project) {
      throw new AppError({
        code: 'PROJECT_NOT_FOUND',
        message: 'Projeto nao encontrado',
        statusCode: 404,
      });
    }

    // Find existing completed render to reuse depth map
    const { data: existingVersion } = await supabaseAdmin
      .from('project_versions')
      .select('metadata, image_url')
      .eq('project_id', projectId)
      .order('version_number', { ascending: false })
      .limit(1)
      .single();

    if (!existingVersion) {
      throw new AppError({
        code: 'NO_EXISTING_RENDER',
        message: 'Nenhum render existente encontrado. Gere um staging primeiro.',
        statusCode: 409,
      });
    }

    const versionMeta = existingVersion.metadata as Record<string, unknown> | null;
    const depthMapUrl = versionMeta?.depth_map_url as string | undefined;
    const photoHash = versionMeta?.photo_hash as string | undefined;

    // Validate style
    const style = stylesRegistry.getById(styleId);
    if (!style) {
      throw new AppError({
        code: 'INVALID_STYLE',
        message: 'Estilo de decoracao invalido',
        statusCode: 400,
      });
    }

    // Enforce quota
    const quota = await quotaService.enforceQuota(userId);
    const resolution = TIER_RESOLUTION[quota.tier];

    // Get original photo URL from project
    const photoUrl = project.original_image_url;
    if (!photoUrl) {
      throw new AppError({
        code: 'NO_ORIGINAL_PHOTO',
        message: 'Foto original do projeto nao encontrada',
        statusCode: 409,
      });
    }

    // Create render job in DB (type: style_change)
    const { data, error } = await supabaseAdmin
      .from('render_jobs')
      .insert({
        project_id: projectId,
        type: 'style_change',
        status: 'queued',
        priority: quota.tier === 'business' ? 1 : quota.tier === 'pro' ? 5 : 10,
        input_params: {
          style_id: styleId,
          photo_url: photoUrl,
          photo_hash: photoHash || '',
          depth_map_url: depthMapUrl,
          resolution,
          prompt_modifier: style.prompt_modifier,
          negative_prompt: style.negative_prompt,
          is_variation: true,
        },
        attempts: 0,
      })
      .select()
      .single();

    const job = data as RenderJobRow | null;

    if (error || !job) {
      logger.error({ err: error }, 'Failed to create variation render job');
      throw new AppError({
        code: 'VARIATION_JOB_CREATE_FAILED',
        message: 'Falha ao criar job de variacao',
        statusCode: 500,
      });
    }

    // Enqueue in BullMQ
    await enqueueRenderJob(
      {
        jobId: job.id,
        projectId,
        userId,
        type: 'style_change',
        inputParams: job.input_params as Record<string, unknown>,
      },
      quota.tier,
    );

    return {
      job_id: job.id,
      status: job.status,
      style_id: styleId,
      resolution,
      reused_depth_map: !!depthMapUrl,
    };
  },
};
