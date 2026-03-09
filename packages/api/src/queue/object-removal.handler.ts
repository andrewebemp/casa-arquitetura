/**
 * Object removal job handler for render worker (Story 3.3, Task 7).
 * Processes object removal jobs via inpainting pipeline.
 */

import { Job } from 'bullmq';
import { objectRemovalService } from '../services/object-removal.service';
import { logger } from '../lib/logger';
import type { RenderJobData } from './render.queue';

export const processObjectRemovalJob = async (job: Job<RenderJobData>): Promise<void> => {
  const { jobId, inputParams } = job.data;

  logger.info({ jobId, type: job.data.type }, 'Processing object removal job');

  await objectRemovalService.processObjectRemovalJob(jobId, inputParams);
};
