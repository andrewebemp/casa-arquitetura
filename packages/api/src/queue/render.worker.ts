import { Worker, Job } from 'bullmq';
import { getRedisClient } from '../lib/redis';
import { supabaseAdmin } from '../lib/supabase';
import { renderEvents } from './render.events';
import { logger } from '../lib/logger';
import { aiPipelineClient } from '../lib/ai-pipeline.client';
import { processRefinementJob } from './refinement.handler';
import type { RenderJobData } from './render.queue';

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
 * AC5: Render worker delegates to AI pipeline HTTP endpoints.
 * Pipeline stages map to progress percentages:
 *   depth (0-20%), style (20-30%), generation (30-80%), upscale (80-95%), upload (95-100%)
 */
const processRenderJob = async (job: Job<RenderJobData>): Promise<void> => {
  const { jobId, inputParams } = job.data;
  const sourceImageUrl = (inputParams.source_image_url as string) || '';
  const style = (inputParams.style as string) || 'moderno';
  const tier = (inputParams.tier as string) || 'free';
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

  // Stage 3: Image generation (30-80%) + upscale (80-95%) + upload (95-100%)
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

  await job.updateProgress(100);

  await updateJobStatus(jobId, 'completed', {
    completed_at: new Date().toISOString(),
    output_params: {
      result_image_url: genResult.result_image_url,
      depth_map_url: depthResult.depth_map_url,
      metadata: genResult.metadata,
    },
    gpu_provider: genResult.metadata.provider,
    duration_ms: genResult.metadata.inference_time_ms,
  });
  await renderEvents.broadcast({ jobId, status: 'completed', progress: 100 });
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
      } else {
        await processRenderJob(job);
      }
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
