import { supabaseAdmin, createUserClient } from '../lib/supabase';
import { AppError } from '../lib/errors';
import { logger } from '../lib/logger';
import { quotaService } from './quota.service';
import { enqueueRenderJob, removeQueueJob } from '../queue/render.queue';
import { renderEvents } from '../queue/render.events';
import { redisHealthCheck } from '../lib/redis';
import { semanticCacheService } from './semantic-cache.service';
import type { Database, RenderJobType, SubscriptionTier } from '@decorai/shared';

type RenderJobRow = Database['public']['Tables']['render_jobs']['Row'];

interface CreateRenderInput {
  projectId: string;
  userId: string;
  type: RenderJobType;
  inputParams: Record<string, unknown>;
  accessToken: string;
}

export const renderService = {
  async createJob(input: CreateRenderInput) {
    const isRedisUp = await redisHealthCheck();
    if (!isRedisUp) {
      throw new AppError({
        code: 'QUEUE_UNAVAILABLE',
        message: 'Servico de fila indisponivel. Tente novamente mais tarde.',
        statusCode: 503,
      });
    }

    // Verify project ownership
    const client = createUserClient(input.accessToken);
    const { data: project, error: projectError } = await client
      .from('projects')
      .select('id')
      .eq('id', input.projectId)
      .eq('user_id', input.userId)
      .single();

    if (projectError || !project) {
      throw new AppError({
        code: 'PROJECT_NOT_FOUND',
        message: 'Projeto nao encontrado',
        statusCode: 404,
      });
    }

    // Check croqui approval gate (AC6: approval required before generation)
    const { data: spatialInput } = await supabaseAdmin
      .from('spatial_inputs')
      .select('croqui_approved')
      .eq('project_id', input.projectId)
      .single();

    if (!spatialInput || !spatialInput.croqui_approved) {
      throw new AppError({
        code: 'CROQUI_NOT_APPROVED',
        message: 'Croqui must be approved before generating render',
        statusCode: 409,
      });
    }

    // Check semantic cache before consuming quota
    const cacheHash = this.computeCacheHash(input.inputParams);
    if (cacheHash) {
      const cached = await semanticCacheService.get(cacheHash);
      if (cached) {
        logger.info({ cacheHash }, 'Semantic cache hit — skipping GPU and quota');
        return {
          id: `cache-${cacheHash.slice(0, 8)}`,
          project_id: input.projectId,
          type: input.type,
          status: 'completed',
          priority: 0,
          input_params: input.inputParams,
          output_params: {
            result_image_url: cached.resultImageUrl,
            original_image_url: cached.originalImageUrl,
            processed_image_url: cached.processedImageUrl,
            depth_map_url: cached.depthMapUrl,
            metadata: cached.metadata,
            cache_hit: true,
          },
          attempts: 0,
          created_at: new Date().toISOString(),
          started_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
          error_message: null,
          gpu_provider: null,
          duration_ms: 0,
        } as unknown as RenderJobRow;
      }
    }

    // Check quota
    const quota = await quotaService.enforceQuota(input.userId);

    // Create render job in DB
    const { data, error } = await supabaseAdmin
      .from('render_jobs')
      .insert({
        project_id: input.projectId,
        type: input.type,
        status: 'queued',
        priority: quota.tier === 'business' ? 1 : quota.tier === 'pro' ? 5 : 10,
        input_params: input.inputParams,
        attempts: 0,
      })
      .select()
      .single();

    const job = data as RenderJobRow | null;

    if (error || !job) {
      logger.error({ err: error }, 'Failed to create render job');
      throw new AppError({
        code: 'RENDER_JOB_CREATE_FAILED',
        message: 'Falha ao criar job de render',
        statusCode: 500,
      });
    }

    // Enqueue in BullMQ
    await enqueueRenderJob(
      {
        jobId: job.id,
        projectId: input.projectId,
        userId: input.userId,
        type: input.type,
        inputParams: input.inputParams,
      },
      quota.tier,
    );

    return job;
  },

  async listJobs(projectId: string, userId: string, accessToken: string) {
    const client = createUserClient(accessToken);

    // Verify project ownership
    const { data: project, error: projectError } = await client
      .from('projects')
      .select('id')
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

    const { data: jobs, error } = await supabaseAdmin
      .from('render_jobs')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) {
      logger.error({ err: error }, 'Failed to list render jobs');
      throw new AppError({
        code: 'RENDER_JOBS_LIST_FAILED',
        message: 'Falha ao listar jobs de render',
        statusCode: 500,
      });
    }

    return jobs ?? [];
  },

  async cancelJob(jobId: string, userId: string, accessToken: string) {
    // Get job
    const { data, error } = await supabaseAdmin
      .from('render_jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    const job = data as RenderJobRow | null;

    if (error || !job) {
      throw new AppError({
        code: 'RENDER_JOB_NOT_FOUND',
        message: 'Job de render nao encontrado',
        statusCode: 404,
      });
    }

    // Verify project ownership
    const client = createUserClient(accessToken);
    const { data: project } = await client
      .from('projects')
      .select('id')
      .eq('id', job.project_id)
      .eq('user_id', userId)
      .single();

    if (!project) {
      throw new AppError({
        code: 'RENDER_JOB_NOT_FOUND',
        message: 'Job de render nao encontrado',
        statusCode: 404,
      });
    }

    if (job.status !== 'queued' && job.status !== 'processing') {
      throw new AppError({
        code: 'RENDER_JOB_NOT_CANCELABLE',
        message: 'Apenas jobs com status queued ou processing podem ser cancelados',
        statusCode: 409,
      });
    }

    // Update status in DB
    const { error: updateError } = await supabaseAdmin
      .from('render_jobs')
      .update({ status: 'canceled' })
      .eq('id', jobId);

    if (updateError) {
      logger.error({ err: updateError }, 'Failed to cancel render job');
      throw new AppError({
        code: 'RENDER_JOB_CANCEL_FAILED',
        message: 'Falha ao cancelar job de render',
        statusCode: 500,
      });
    }

    // Remove from BullMQ queue
    await removeQueueJob(jobId);

    // Broadcast cancellation
    await renderEvents.broadcast({ jobId, status: 'canceled' });

    return { id: jobId, status: 'canceled' };
  },

  computeCacheHash(inputParams: Record<string, unknown>): string | null {
    const sourceImageHash = inputParams.source_image_hash as string;
    const styleId = inputParams.style_id as string;
    const width = inputParams.width as number;
    const height = inputParams.height as number;
    const seed = inputParams.seed as number;
    const promptHash = inputParams.prompt_hash as string;

    if (!sourceImageHash || !styleId || !width || !height || seed == null || !promptHash) {
      return null;
    }

    return semanticCacheService.computeHash({
      sourceImageHash,
      styleId,
      width,
      height,
      seed,
      promptHash,
    });
  },

  /**
   * AC-6: Resolve the correct image URL based on current tier.
   * Free tier → processed_image_url (with watermark + disclaimer)
   * Paid tier → original_image_url (with disclaimer only, no watermark)
   * Disclaimer remains on all images regardless of tier.
   */
  resolveImageUrl(
    outputParams: Record<string, unknown> | null,
    currentTier: SubscriptionTier,
  ): string | null {
    if (!outputParams) return null;

    const originalUrl = outputParams.original_image_url as string | undefined;
    const processedUrl = outputParams.processed_image_url as string | undefined;
    const resultUrl = outputParams.result_image_url as string | undefined;

    if (currentTier === 'free') {
      // Free tier: use processed (watermark + disclaimer) if available
      return processedUrl ?? resultUrl ?? null;
    }

    // Paid tier: use original (no watermark), disclaimer will still be present
    // via the processed pipeline, but without the watermark overlay
    return originalUrl ?? resultUrl ?? null;
  },
};
