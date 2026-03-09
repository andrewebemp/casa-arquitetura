import { supabaseAdmin } from '../lib/supabase';
import { logger } from '../lib/logger';
import { imagePostProcessingService } from './image-post-processing.service';
import type { SubscriptionTier } from '@decorai/shared';

interface WatermarkInfo {
  enabled: boolean;
  text: string;
  position: string;
  opacity: number;
}

const WATERMARK_TEXT = 'DecorAI Brasil';
const DISCLAIMER_TEXT = 'Imagem ilustrativa gerada por IA | DecorAI Brasil';

function getWatermarkInfo(includeWatermark: boolean): WatermarkInfo | null {
  if (!includeWatermark) {
    return null;
  }

  return {
    enabled: true,
    text: WATERMARK_TEXT,
    position: 'bottom-right',
    opacity: 0.5,
  };
}

async function downloadImage(imageUrl: string): Promise<Buffer> {
  if (imageUrl.startsWith('http')) {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.status}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  // Storage path — download from Supabase
  const { data, error } = await supabaseAdmin.storage
    .from('project-images')
    .download(imageUrl);

  if (error || !data) {
    throw new Error(`Failed to download from storage: ${error?.message ?? 'no data'}`);
  }

  const arrayBuffer = await data.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function uploadProcessedImage(
  buffer: Buffer,
  originalPath: string,
): Promise<string> {
  const ext = originalPath.includes('.png') ? 'png' : 'jpg';
  const basePath = originalPath.replace(/\.[^.]+$/, '');
  const processedPath = `${basePath}_processed.${ext}`;

  const { error } = await supabaseAdmin.storage
    .from('project-images')
    .upload(processedPath, buffer, {
      contentType: ext === 'png' ? 'image/png' : 'image/jpeg',
      upsert: true,
    });

  if (error) {
    throw new Error(`Failed to upload processed image: ${error.message}`);
  }

  const { data: signedUrl } = await supabaseAdmin.storage
    .from('project-images')
    .createSignedUrl(processedPath, 86400);

  return signedUrl?.signedUrl ?? processedPath;
}

export const watermarkService = {
  shouldApplyWatermark(includeWatermark: boolean): boolean {
    return includeWatermark;
  },

  getWatermarkInfo,

  async getImageUrl(
    imagePath: string,
    includeWatermark: boolean,
  ): Promise<{ url: string; watermark: WatermarkInfo | null }> {
    let url = imagePath;

    if (!imagePath.startsWith('http')) {
      const { data, error } = await supabaseAdmin.storage
        .from('project-images')
        .createSignedUrl(imagePath, 3600);

      if (error) {
        logger.error({ err: error }, 'Failed to create signed URL for watermark');
        url = imagePath;
      } else {
        url = data.signedUrl;
      }
    }

    return {
      url,
      watermark: getWatermarkInfo(includeWatermark),
    };
  },

  /**
   * AC-3/AC-4: Full post-processing pipeline.
   * Downloads image, applies watermark (if Free tier) and disclaimer (always),
   * uploads processed image, returns both URLs.
   * AC-7: Failures never cause render job to fail.
   */
  async applyPostProcessing(
    imageUrl: string,
    tier: SubscriptionTier,
  ): Promise<{
    original_image_url: string;
    processed_image_url: string;
    post_processing_failed: boolean;
  }> {
    const isFreeTier = tier === 'free';

    try {
      logger.info({ imageUrl, tier, isFreeTier }, 'Starting image post-processing');

      const imageBuffer = await downloadImage(imageUrl);

      const processedBuffer = await imagePostProcessingService.processImage(imageBuffer, {
        applyWatermark: isFreeTier,
        applyDisclaimer: true,
        watermarkText: WATERMARK_TEXT,
        disclaimerText: DISCLAIMER_TEXT,
      });

      // Derive a storage path for upload
      const storagePath = imageUrl.startsWith('http')
        ? `processed/${Date.now()}_processed`
        : imageUrl;

      const processedUrl = await uploadProcessedImage(processedBuffer, storagePath);

      logger.info({ processedUrl, tier }, 'Image post-processing complete');

      return {
        original_image_url: imageUrl,
        processed_image_url: processedUrl,
        post_processing_failed: false,
      };
    } catch (error) {
      logger.error(
        { err: error, imageUrl, tier },
        'Post-processing pipeline failed, using original image',
      );

      return {
        original_image_url: imageUrl,
        processed_image_url: imageUrl,
        post_processing_failed: true,
      };
    }
  },

  /**
   * AC-6: Re-process image for disclaimer only (no watermark).
   * Used when a Free tier user upgrades to paid tier.
   */
  async applyDisclaimerOnly(
    imageUrl: string,
  ): Promise<string> {
    const imageBuffer = await downloadImage(imageUrl);

    const processedBuffer = await imagePostProcessingService.processImage(imageBuffer, {
      applyWatermark: false,
      applyDisclaimer: true,
      watermarkText: WATERMARK_TEXT,
      disclaimerText: DISCLAIMER_TEXT,
    });

    const storagePath = imageUrl.startsWith('http')
      ? `processed/${Date.now()}_disclaimer`
      : imageUrl;

    return uploadProcessedImage(processedBuffer, storagePath);
  },

  /**
   * AC-6: Get the appropriate image URL based on user tier.
   * Free tier gets processed (watermarked) image.
   * Paid tiers get original image (disclaimer remains per regulatory requirement).
   */
  getImageUrlForTier(
    originalUrl: string | undefined,
    processedUrl: string | undefined,
    tier: string,
  ): string {
    if (tier === 'free') {
      return processedUrl ?? originalUrl ?? '';
    }
    return originalUrl ?? processedUrl ?? '';
  },
};
