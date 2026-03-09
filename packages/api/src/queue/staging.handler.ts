/**
 * Staging job handler for render worker (Story 1.3, AC3/AC4).
 * Processes staging generation and style variation jobs.
 */

import { Job } from 'bullmq';
import { stagingService } from '../services/staging.service';
import { logger } from '../lib/logger';
import type { RenderJobData } from './render.queue';

export const processStagingJob = async (job: Job<RenderJobData>): Promise<void> => {
  const { jobId, inputParams } = job.data;

  logger.info({ jobId, type: job.data.type }, 'Processing staging job');

  await stagingService.processJob(jobId, inputParams);
};
