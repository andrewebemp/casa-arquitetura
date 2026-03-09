import { supabaseAdmin } from '../lib/supabase';
import { logger } from '../lib/logger';

interface WatermarkInfo {
  enabled: boolean;
  text: string;
  position: string;
  opacity: number;
}

function getWatermarkInfo(includeWatermark: boolean): WatermarkInfo | null {
  if (!includeWatermark) {
    return null;
  }

  return {
    enabled: true,
    text: 'DecorAI Brasil',
    position: 'bottom-right',
    opacity: 0.5,
  };
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
};
