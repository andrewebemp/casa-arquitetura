import { Worker, Job } from 'bullmq';
import { getRedisClient } from '../lib/redis';
import { supabaseAdmin } from '../lib/supabase';
import { renderEvents } from './render.events';
import { logger } from '../lib/logger';
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

const processRenderJob = async (job: Job<RenderJobData>): Promise<void> => {
  const { jobId } = job.data;

  await updateJobStatus(jobId, 'processing', {
    started_at: new Date().toISOString(),
  });
  await renderEvents.broadcast({ jobId, status: 'processing', progress: 0 });

  // Skeleton: simulate processing stages
  // In future stories, this will delegate to the AI pipeline HTTP client
  await job.updateProgress(50);
  await renderEvents.broadcast({ jobId, status: 'processing', progress: 50 });

  await job.updateProgress(100);

  await updateJobStatus(jobId, 'completed', {
    completed_at: new Date().toISOString(),
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
      await processRenderJob(job);
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
