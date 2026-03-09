/**
 * Post-processing handler for render worker (Story 6.6, AC-3/AC-7).
 * Applies watermark (Free tier) and disclaimer (all tiers) after AI pipeline returns.
 * Graceful fallback: if post-processing fails, original image is used.
 */

import { watermarkService } from '../services/watermark.service';
import { logger } from '../lib/logger';
import type { SubscriptionTier } from '@decorai/shared';

export interface PostProcessingResult {
  result_image_url: string;
  original_image_url: string;
  processed_image_url: string | null;
  post_processing_applied: boolean;
  post_processing_failed?: boolean;
}

/**
 * AC-3: Runs post-processing on completed render job output.
 * AC-7: Never causes the entire render job to fail.
 */
export async function applyRenderPostProcessing(
  jobId: string,
  resultImageUrl: string,
  tier: SubscriptionTier,
): Promise<PostProcessingResult> {
  const result = await watermarkService.applyPostProcessing(resultImageUrl, tier);

  if (result.post_processing_failed) {
    logger.warn({ jobId, tier }, 'Post-processing failed, using original image');
  } else {
    logger.info({ jobId, tier }, 'Post-processing applied successfully');
  }

  return {
    result_image_url: result.post_processing_failed
      ? resultImageUrl
      : result.processed_image_url,
    original_image_url: result.original_image_url,
    processed_image_url: result.post_processing_failed
      ? null
      : result.processed_image_url,
    post_processing_applied: !result.post_processing_failed,
    ...(result.post_processing_failed ? { post_processing_failed: true } : {}),
  };
}
