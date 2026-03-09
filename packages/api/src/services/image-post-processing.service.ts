import sharp from 'sharp';
import { logger } from '../lib/logger';

export interface PostProcessingOptions {
  applyWatermark: boolean;
  applyDisclaimer: boolean;
  watermarkText: string;
  disclaimerText: string;
}

const DEFAULT_WATERMARK_TEXT = 'DecorAI Brasil';
const DEFAULT_DISCLAIMER_TEXT = 'Imagem ilustrativa gerada por IA | DecorAI Brasil';

/**
 * Creates an SVG text element for watermark rendering.
 * The watermark is diagonal (45deg), centered, repeated pattern, 30% opacity white with dark shadow.
 */
function createWatermarkSvg(width: number, height: number, text: string): Buffer {
  const fontSize = Math.max(Math.round(width * 0.05), 16);
  const diagonal = Math.sqrt(width * width + height * height);
  const spacing = fontSize * 4;
  const lines: string[] = [];

  for (let y = -diagonal; y < diagonal * 2; y += spacing) {
    for (let x = -diagonal; x < diagonal * 2; x += spacing) {
      lines.push(
        `<text x="${x}" y="${y}" font-size="${fontSize}" font-family="Arial, sans-serif" font-weight="bold" fill="rgba(0,0,0,0.15)" transform="rotate(-45, ${x}, ${y})">${text}</text>`,
      );
      lines.push(
        `<text x="${x}" y="${y}" font-size="${fontSize}" font-family="Arial, sans-serif" font-weight="bold" fill="rgba(255,255,255,0.30)" transform="rotate(-45, ${x + 2}, ${y + 2})">${text}</text>`,
      );
    }
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">${lines.join('')}</svg>`;

  return Buffer.from(svg);
}

/**
 * Creates an SVG disclaimer bar for the bottom of the image.
 * Semi-transparent dark background (70% black), white text, centered.
 * Height: ~2.5% of image height.
 */
function createDisclaimerSvg(width: number, height: number, text: string): Buffer {
  const barHeight = Math.max(Math.round(height * 0.025), 20);
  const fontSize = Math.max(Math.round(barHeight * 0.6), 10);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${barHeight}">
  <rect x="0" y="0" width="${width}" height="${barHeight}" fill="rgba(0,0,0,0.70)" />
  <text x="${width / 2}" y="${barHeight / 2 + fontSize / 3}" font-size="${fontSize}" font-family="Arial, sans-serif" fill="white" text-anchor="middle">${text}</text>
</svg>`;

  return Buffer.from(svg);
}

export const imagePostProcessingService = {
  /**
   * Apply diagonal watermark text across the image.
   * AC-1: Semi-transparent, centered, covers main subject area.
   */
  async applyWatermark(
    imageBuffer: Buffer,
    text: string = DEFAULT_WATERMARK_TEXT,
  ): Promise<Buffer> {
    const metadata = await sharp(imageBuffer).metadata();
    const width = metadata.width || 1024;
    const height = metadata.height || 1024;

    const watermarkSvg = createWatermarkSvg(width, height, text);

    return sharp(imageBuffer)
      .composite([{
        input: watermarkSvg,
        top: 0,
        left: 0,
      }])
      .toBuffer();
  },

  /**
   * Apply disclaimer bar at the bottom of the image.
   * AC-2: Small bar, max 3% of image height, semi-transparent dark bg, white text.
   */
  async applyDisclaimer(
    imageBuffer: Buffer,
    text: string = DEFAULT_DISCLAIMER_TEXT,
  ): Promise<Buffer> {
    const metadata = await sharp(imageBuffer).metadata();
    const width = metadata.width || 1024;
    const height = metadata.height || 1024;

    const barHeight = Math.max(Math.round(height * 0.025), 20);
    const disclaimerSvg = createDisclaimerSvg(width, height, text);

    return sharp(imageBuffer)
      .composite([{
        input: disclaimerSvg,
        top: height - barHeight,
        left: 0,
      }])
      .toBuffer();
  },

  /**
   * AC-4: Combined post-processing pipeline.
   * Applies watermark (if enabled) then disclaimer (if enabled) in a single pass.
   */
  async processImage(
    imageBuffer: Buffer,
    options: PostProcessingOptions,
  ): Promise<Buffer> {
    const metadata = await sharp(imageBuffer).metadata();
    const width = metadata.width || 1024;
    const height = metadata.height || 1024;

    const composites: sharp.OverlayOptions[] = [];

    if (options.applyWatermark) {
      const watermarkSvg = createWatermarkSvg(width, height, options.watermarkText);
      composites.push({
        input: watermarkSvg,
        top: 0,
        left: 0,
      });
    }

    if (options.applyDisclaimer) {
      const barHeight = Math.max(Math.round(height * 0.025), 20);
      const disclaimerSvg = createDisclaimerSvg(width, height, options.disclaimerText);
      composites.push({
        input: disclaimerSvg,
        top: height - barHeight,
        left: 0,
      });
    }

    if (composites.length === 0) {
      return imageBuffer;
    }

    return sharp(imageBuffer)
      .composite(composites)
      .toBuffer();
  },

  /**
   * Download image from URL as buffer.
   */
  async downloadImage(imageUrl: string): Promise<Buffer> {
    const response = await fetch(imageUrl);

    if (!response.ok) {
      throw new Error(`Failed to download image: HTTP ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  },

  /**
   * AC-7: Safely process with error fallback.
   * Post-processing failures never cause render job to fail.
   */
  async safeProcessImage(
    imageBuffer: Buffer,
    options: PostProcessingOptions,
  ): Promise<{ buffer: Buffer; success: boolean }> {
    try {
      const processed = await this.processImage(imageBuffer, options);
      return { buffer: processed, success: true };
    } catch (error) {
      logger.error(
        { err: error },
        'Post-processing failed, returning original image',
      );
      return { buffer: imageBuffer, success: false };
    }
  },
};
