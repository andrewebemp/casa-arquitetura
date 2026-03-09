/**
 * Lighting enhancement job handler for render worker (Story 3.2, Task 6).
 * Processes lighting enhancement jobs via IC-Light pipeline.
 */

import { Job } from 'bullmq';
import { lightingService } from '../services/lighting.service';
import { logger } from '../lib/logger';
import type { RenderJobData } from './render.queue';

export const processLightingJob = async (job: Job<RenderJobData>): Promise<void> => {
  const { jobId, inputParams } = job.data;

  logger.info({ jobId, type: job.data.type }, 'Processing lighting enhancement job');

  await lightingService.processLightingJob(jobId, inputParams);
};
