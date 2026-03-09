/**
 * Segmentation job handler for render worker (Story 3.1, Task 10).
 * Processes material swap jobs via segmentation pipeline.
 */

import { Job } from 'bullmq';
import { segmentationService } from '../services/segmentation.service';
import { logger } from '../lib/logger';
import type { RenderJobData } from './render.queue';

export const processSegmentationJob = async (job: Job<RenderJobData>): Promise<void> => {
  const { jobId, inputParams } = job.data;

  logger.info({ jobId, type: job.data.type }, 'Processing segmentation job');

  await segmentationService.processSegmentationJob(jobId, inputParams);
};
