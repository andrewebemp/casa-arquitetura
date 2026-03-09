import { Queue } from 'bullmq';
import { getRedisClient } from '../lib/redis';
import type { SubscriptionTier } from '@decorai/shared';

const BULLMQ_PRIORITY: Record<SubscriptionTier, number> = {
  business: 1,
  pro: 5,
  free: 10,
};

export interface RenderJobData {
  jobId: string;
  projectId: string;
  userId: string;
  type: string;
  inputParams: Record<string, unknown>;
}

let renderQueue: Queue<RenderJobData> | null = null;

export const getRenderQueue = (): Queue<RenderJobData> => {
  if (!renderQueue) {
    renderQueue = new Queue<RenderJobData>('render', {
      connection: getRedisClient(),
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
        removeOnComplete: { count: 100 },
        removeOnFail: { count: 50 },
      },
    });
  }

  return renderQueue!;
};

export const getPriorityForTier = (tier: SubscriptionTier): number => {
  return BULLMQ_PRIORITY[tier];
};

export const enqueueRenderJob = async (
  data: RenderJobData,
  tier: SubscriptionTier,
): Promise<string> => {
  const queue = getRenderQueue();
  const priority = getPriorityForTier(tier);

  const job = await queue.add('render-job', data, {
    priority,
    jobId: data.jobId,
  });

  return job.id!;
};

export const removeQueueJob = async (jobId: string): Promise<boolean> => {
  const queue = getRenderQueue();
  const job = await queue.getJob(jobId);

  if (job) {
    await job.remove();
    return true;
  }

  return false;
};

export const closeRenderQueue = async (): Promise<void> => {
  if (renderQueue) {
    await renderQueue.close();
    renderQueue = null;
  }
};
