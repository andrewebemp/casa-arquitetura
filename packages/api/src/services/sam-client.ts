/**
 * SAM 2 Client Service (Story 3.1, Task 1)
 * Interfaces with AI pipeline for point-based and automatic segmentation via fal.ai/Replicate.
 */

import { aiPipelineClient } from '../lib/ai-pipeline.client';
import { logger } from '../lib/logger';

export interface SegmentResult {
  segment_id: string;
  label: string;
  mask_url: string;
  polygon: Array<{ x: number; y: number }>;
  bounding_box: { x: number; y: number; width: number; height: number };
  confidence: number;
}

export interface PointSegmentInput {
  image_url: string;
  x: number;
  y: number;
}

export interface BoxSegmentInput {
  image_url: string;
  box: { x: number; y: number; width: number; height: number };
}

export interface AutoSegmentInput {
  image_url: string;
}

export const samClient = {
  async segmentByPoint(input: PointSegmentInput): Promise<SegmentResult> {
    logger.info({ x: input.x, y: input.y }, 'SAM point-based segmentation');

    const result = await aiPipelineClient.segment({
      image_url: input.image_url,
      mode: 'point',
      point: { x: input.x, y: input.y },
    });

    return result.segments[0];
  },

  async segmentByBox(input: BoxSegmentInput): Promise<SegmentResult> {
    logger.info({ box: input.box }, 'SAM box-based segmentation');

    const result = await aiPipelineClient.segment({
      image_url: input.image_url,
      mode: 'box',
      box: input.box,
    });

    return result.segments[0];
  },

  async segmentAll(input: AutoSegmentInput): Promise<SegmentResult[]> {
    logger.info('SAM auto segmentation');

    const result = await aiPipelineClient.segment({
      image_url: input.image_url,
      mode: 'auto',
    });

    return result.segments;
  },
};
