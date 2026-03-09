/**
 * Inpainting Service (Story 3.1, Task 7)
 * Material swap: mask + material prompt -> SDXL inpainting -> result.
 */

import { aiPipelineClient } from '../lib/ai-pipeline.client';
import { logger } from '../lib/logger';

export const inpaintingService = {
  buildPrompt(materialDescriptor: string): { prompt: string; negativePrompt: string } {
    const prompt = `${materialDescriptor}, photorealistic interior design, high quality, professional photography, 8k, detailed texture`;
    const negativePrompt = 'low quality, blurry, artifacts, seams, visible mask edges, distorted, unrealistic';
    return { prompt, negativePrompt };
  },

  async swapMaterial(params: {
    imageUrl: string;
    segmentId: string;
    materialDescriptor: string;
    maskUrl?: string;
    depthMapUrl?: string;
  }) {
    const { imageUrl, segmentId, materialDescriptor, depthMapUrl } = params;

    logger.info({ segmentId, materialDescriptor }, 'Inpainting: material swap');

    // Re-segment to get mask for the specific segment
    const segmentResult = await aiPipelineClient.segment({
      image_url: imageUrl,
      mode: 'auto',
    });

    const targetSegment = segmentResult.segments.find((s) => s.segment_id === segmentId);
    const maskUrl = targetSegment ? targetSegment.mask_url : params.maskUrl || '';

    if (!maskUrl) {
      throw new Error(`Segment ${segmentId} not found in image`);
    }

    // Build SDXL prompt from material descriptor
    const { prompt, negativePrompt } = this.buildPrompt(materialDescriptor);

    // Call AI pipeline for inpainting
    const result = await aiPipelineClient.inpaint({
      image_url: imageUrl,
      mask_url: maskUrl,
      prompt,
      negative_prompt: negativePrompt,
      depth_map_url: depthMapUrl,
    });

    return {
      result_image_url: result.result_image_url,
      provider: result.metadata.provider,
      inference_time_ms: result.metadata.inference_time_ms,
    };
  },
};
