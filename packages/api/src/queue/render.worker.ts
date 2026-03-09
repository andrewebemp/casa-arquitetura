import { Worker, Job } from 'bullmq';
import { getRedisClient } from '../lib/redis';
import { supabaseAdmin } from '../lib/supabase';
import { renderEvents } from './render.events';
import { logger } from '../lib/logger';
import { aiPipelineClient } from '../lib/ai-pipeline.client';
import { applyRenderPostProcessing } from './post-processing.handler';
import { processRefinementJob } from './refinement.handler';
import { processStagingJob } from './staging.handler';
import { processSegmentationJob } from './segmentation.handler';
import { processLightingJob } from './lighting.handler';
import { processObjectRemovalJob } from './object-removal.handler';
import { semanticCacheService } from '../services/semantic-cache.service';
import { renderService } from '../services/render.service';
import type { RenderJobData } from './render.queue';
import type { SubscriptionTier } from '@decorai/shared';

const updateJobStatus = async (
  jobId: string,
  status: string,
  extra: Record<string, unknown> = {},
): Promise<void> => {
  const { error } = await supabaseAdmin
    .from('render_jobs')
    .update({ status, ...extra })
    .eq('id', jobId);

  if (error) {
    logger.error({ err: error, jobId, status }, 'Failed to update render job status');
  }
};

/**
 * Determine user's subscription tier from their userId.
 */
const getUserTier = async (userId: string): Promise<SubscriptionTier> => {
  const { data } = await supabaseAdmin
    .from('subscriptions')
    .select('tier')
    .eq('user_id', userId)
    .single();

  if (!data) return 'free';
  return (data as { tier: string }).tier as SubscriptionTier;
};

/**
 * AC-3: Apply post-processing to a completed render job.
 * Reads the job's output_params, applies watermark/disclaimer, updates output.
 * AC-7: Failures never cause the render job to fail.
 */
const applyPostProcessingToJob = async (
  jobId: string,
  userId: string,
  tier?: SubscriptionTier,
): Promise<void> => {
  try {
    const userTier = tier ?? await getUserTier(userId);

    // Read completed job output
    const { data: job } = await supabaseAdmin
      .from('render_jobs')
      .select('output_params')
      .eq('id', jobId)
      .single();

    if (!job) return;

    const outputParams = (job as { output_params: Record<string, unknown> | null }).output_params;
    if (!outputParams) return;

    // Find the result image URL
    const resultUrl = (outputParams.result_image_url as string)
      || (outputParams.result_url as string)
      || '';

    if (!resultUrl) return;

    // Already processed (has original_image_url set)
    if (outputParams.original_image_url) return;

    // Apply post-processing
    const ppResult = await applyRenderPostProcessing(jobId, resultUrl, userTier);

    // Update output_params with post-processing results
    await supabaseAdmin
      .from('render_jobs')
      .update({
        output_params: {
          ...outputParams,
          original_image_url: ppResult.original_image_url,
          processed_image_url: ppResult.processed_image_url,
          result_image_url: ppResult.result_image_url,
          post_processing_applied: ppResult.post_processing_applied,
          ...(ppResult.post_processing_failed ? { post_processing_failed: true } : {}),
        },
      })
      .eq('id', jobId);
  } catch (error) {
    // AC-7: Post-processing failures never cause render job to fail
    logger.error(
      { err: error, jobId },
      'Post-processing wrapper failed, job remains with original image',
    );
  }
};

/**
 * AC5: Render worker delegates to AI pipeline HTTP endpoints.
 * Pipeline stages map to progress percentages:
 *   depth (0-20%), style (20-30%), generation (30-80%), upscale (80-95%), post-process (95-100%)
 */
const processRenderJob = async (job: Job<RenderJobData>): Promise<void> => {
  const { jobId, inputParams } = job.data;
  const sourceImageUrl = (inputParams.source_image_url as string) || '';
  const style = (inputParams.style as string) || 'moderno';
  const tier = ((inputParams.tier as string) || 'free') as SubscriptionTier;
  const callbackUrl = (inputParams.callback_url as string) || '';
  const outputResolution = tier === 'free' ? '1024x1024' : '2048x2048';

  await updateJobStatus(jobId, 'processing', {
    started_at: new Date().toISOString(),
  });
  await renderEvents.broadcast({ jobId, status: 'processing', progress: 0 });

  // Stage 1: Depth estimation (0-20%)
  await job.updateProgress(5);
  await renderEvents.broadcast({ jobId, status: 'processing', progress: 5 });

  const depthResult = await aiPipelineClient.analyzeDepth(sourceImageUrl);

  await job.updateProgress(20);
  await renderEvents.broadcast({ jobId, status: 'processing', progress: 20 });

  // Stage 2: Style extraction (20-30%)
  const styleResult = await aiPipelineClient.analyzeStyle(style);

  await job.updateProgress(30);
  await renderEvents.broadcast({ jobId, status: 'processing', progress: 30 });

  // Stage 3: Image generation (30-80%) + upscale (80-95%)
  const genResult = await aiPipelineClient.generate({
    sourceImageUrl,
    depthMapUrl: depthResult.depth_map_url,
    styleParams: {
      style_prompt: styleResult.style_prompt,
      negative_prompt: styleResult.negative_prompt,
      controlnet_params: styleResult.controlnet_params,
    },
    outputResolution: outputResolution as '1024x1024' | '2048x2048',
    callbackUrl: callbackUrl || undefined,
  });

  await job.updateProgress(95);
  await renderEvents.broadcast({ jobId, status: 'processing', progress: 95 });

  // Stage 4: Post-processing — watermark (Free) + disclaimer (all tiers) (95-100%)
  const ppResult = await applyRenderPostProcessing(jobId, genResult.result_image_url, tier);

  await job.updateProgress(100);

  await updateJobStatus(jobId, 'completed', {
    completed_at: new Date().toISOString(),
    output_params: {
      result_image_url: ppResult.result_image_url,
      original_image_url: ppResult.original_image_url,
      processed_image_url: ppResult.processed_image_url,
      depth_map_url: depthResult.depth_map_url,
      metadata: genResult.metadata,
      post_processing_applied: ppResult.post_processing_applied,
      ...(ppResult.post_processing_failed ? { post_processing_failed: true } : {}),
    },
    gpu_provider: genResult.metadata.provider,
    duration_ms: genResult.metadata.inference_time_ms,
  });
  await renderEvents.broadcast({ jobId, status: 'completed', progress: 100 });
};

/**
 * Store completed render result in semantic cache for future hits.
 */
const storeInSemanticCache = async (jobData: RenderJobData): Promise<void> => {
  try {
    const cacheHash = renderService.computeCacheHash(jobData.inputParams);
    if (!cacheHash) return;

    // Read the completed job output
    const { data: job } = await supabaseAdmin
      .from('render_jobs')
      .select('output_params')
      .eq('id', jobData.jobId)
      .single();

    if (!job) return;

    const output = (job as { output_params: Record<string, unknown> | null }).output_params;
    if (!output) return;

    await semanticCacheService.set(cacheHash, {
      resultImageUrl: (output.result_image_url as string) || '',
      originalImageUrl: (output.original_image_url as string) || '',
      processedImageUrl: (output.processed_image_url as string) || '',
      depthMapUrl: (output.depth_map_url as string) || '',
      metadata: (output.metadata as Record<string, unknown>) || {},
    });
  } catch (err) {
    logger.error({ err, jobId: jobData.jobId }, 'Failed to store render in semantic cache');
  }
};

let renderWorker: Worker<RenderJobData> | null = null;

export const startRenderWorker = (): Worker<RenderJobData> => {
  if (renderWorker) {
    return renderWorker;
  }

  renderWorker = new Worker<RenderJobData>(
    'render',
    async (job) => {
      logger.info({ jobId: job.data.jobId, type: job.data.type }, 'Processing render job');
      if (job.data.type === 'refinement') {
        await processRefinementJob(job);
        await applyPostProcessingToJob(job.data.jobId, job.data.userId);
      } else if (job.data.type === 'initial' && job.data.inputParams.style_id) {
        await processStagingJob(job);
        await applyPostProcessingToJob(job.data.jobId, job.data.userId);
      } else if (job.data.type === 'style_change') {
        await processStagingJob(job);
        await applyPostProcessingToJob(job.data.jobId, job.data.userId);
      } else if (job.data.type === 'segmentation') {
        await processSegmentationJob(job);
        await applyPostProcessingToJob(job.data.jobId, job.data.userId);
      } else if (job.data.type === 'lighting_enhancement') {
        await processLightingJob(job);
        await applyPostProcessingToJob(job.data.jobId, job.data.userId);
      } else if (job.data.type === 'object_removal') {
        await processObjectRemovalJob(job);
        await applyPostProcessingToJob(job.data.jobId, job.data.userId);
      } else {
        // processRenderJob already has post-processing built in
        await processRenderJob(job);
      }

      // Store completed render in semantic cache
      await storeInSemanticCache(job.data);
    },
    {
      connection: getRedisClient(),
      concurrency: 2,
    },
  );

  renderWorker.on('failed', async (job, err) => {
    if (!job) return;
    const { jobId } = job.data;

    logger.error({ err, jobId }, 'Render job failed');

    await updateJobStatus(jobId, 'failed', {
      error_message: err.message,
      attempts: job.attemptsMade,
    });
    await renderEvents.broadcast({
      jobId,
      status: 'failed',
      error_message: err.message,
    });
  });

  renderWorker.on('error', (err) => {
    logger.error({ err }, 'Render worker error');
  });

  return renderWorker;
};

export const stopRenderWorker = async (): Promise<void> => {
  if (renderWorker) {
    await renderWorker.close();
    renderWorker = null;
  }
};
