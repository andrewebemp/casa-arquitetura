import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockMetadata = vi.fn();
const mockComposite = vi.fn();
const mockToBuffer = vi.fn();

vi.mock('sharp', () => ({
  default: vi.fn().mockImplementation(() => ({
    metadata: mockMetadata,
    composite: mockComposite,
    toBuffer: mockToBuffer,
  })),
}));

vi.mock('../lib/logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
  },
}));

vi.mock('../config/env', () => ({
  env: {
    SUPABASE_URL: 'https://test.supabase.co',
    SUPABASE_ANON_KEY: 'test-anon-key',
    SUPABASE_SERVICE_ROLE_KEY: 'test-service-key',
    REDIS_URL: 'redis://localhost:6379',
    PORT: 3001,
    NODE_ENV: 'test',
    CORS_ORIGINS: 'http://localhost:3000',
  },
}));

import { imagePostProcessingService } from '../services/image-post-processing.service';
import { logger } from '../lib/logger';

const testImageBuffer = Buffer.from('test-image-data');
const processedBuffer = Buffer.from('processed-image-data');

describe('imagePostProcessingService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockMetadata.mockResolvedValue({ width: 1024, height: 1024 });
    mockComposite.mockReturnValue({ toBuffer: mockToBuffer });
    mockToBuffer.mockResolvedValue(processedBuffer);
  });

  describe('applyWatermark', () => {
    it('should apply watermark overlay to image buffer', async () => {
      const result = await imagePostProcessingService.applyWatermark(testImageBuffer);

      expect(result).toEqual(processedBuffer);
      expect(mockMetadata).toHaveBeenCalled();
      expect(mockComposite).toHaveBeenCalledWith([
        expect.objectContaining({
          input: expect.any(Buffer),
          top: 0,
          left: 0,
        }),
      ]);
    });

    it('should use custom watermark text', async () => {
      await imagePostProcessingService.applyWatermark(testImageBuffer, 'Custom Text');

      expect(mockComposite).toHaveBeenCalledWith([
        expect.objectContaining({
          input: expect.any(Buffer),
        }),
      ]);

      const svgBuffer = mockComposite.mock.calls[0][0][0].input as Buffer;
      const svgText = svgBuffer.toString();
      expect(svgText).toContain('Custom Text');
    });

    it('should use default watermark text "DecorAI Brasil"', async () => {
      await imagePostProcessingService.applyWatermark(testImageBuffer);

      const svgBuffer = mockComposite.mock.calls[0][0][0].input as Buffer;
      const svgText = svgBuffer.toString();
      expect(svgText).toContain('DecorAI Brasil');
    });

    it('should scale watermark proportionally to image dimensions', async () => {
      mockMetadata.mockResolvedValue({ width: 2048, height: 2048 });

      await imagePostProcessingService.applyWatermark(testImageBuffer);

      const svgBuffer = mockComposite.mock.calls[0][0][0].input as Buffer;
      const svgText = svgBuffer.toString();
      // 2048 * 0.05 = 102.4 → rounded = 102
      expect(svgText).toContain('font-size="102"');
    });
  });

  describe('applyDisclaimer', () => {
    it('should apply disclaimer bar at bottom of image', async () => {
      const result = await imagePostProcessingService.applyDisclaimer(testImageBuffer);

      expect(result).toEqual(processedBuffer);
      const compositeArgs = mockComposite.mock.calls[0][0][0];
      // bar height: 1024 * 0.025 = 25.6 → rounded = 26
      expect(compositeArgs.top).toBe(1024 - 26);
      expect(compositeArgs.left).toBe(0);
    });

    it('should include default disclaimer text', async () => {
      await imagePostProcessingService.applyDisclaimer(testImageBuffer);

      const svgBuffer = mockComposite.mock.calls[0][0][0].input as Buffer;
      const svgText = svgBuffer.toString();
      expect(svgText).toContain('Imagem ilustrativa gerada por IA | DecorAI Brasil');
    });

    it('should use custom disclaimer text', async () => {
      await imagePostProcessingService.applyDisclaimer(testImageBuffer, 'Custom disclaimer');

      const svgBuffer = mockComposite.mock.calls[0][0][0].input as Buffer;
      const svgText = svgBuffer.toString();
      expect(svgText).toContain('Custom disclaimer');
    });

    it('should keep bar height under 3% of image height', async () => {
      mockMetadata.mockResolvedValue({ width: 1024, height: 1024 });

      await imagePostProcessingService.applyDisclaimer(testImageBuffer);

      const compositeArgs = mockComposite.mock.calls[0][0][0];
      const barHeight = 1024 - compositeArgs.top;
      expect(barHeight / 1024).toBeLessThanOrEqual(0.03);
    });
  });

  describe('processImage', () => {
    it('should apply both watermark and disclaimer when both enabled', async () => {
      await imagePostProcessingService.processImage(testImageBuffer, {
        applyWatermark: true,
        applyDisclaimer: true,
        watermarkText: 'DecorAI Brasil',
        disclaimerText: 'AI generated',
      });

      expect(mockComposite).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ top: 0, left: 0 }), // watermark
          expect.objectContaining({ left: 0 }), // disclaimer
        ]),
      );
      // Should have 2 composites
      expect(mockComposite.mock.calls[0][0]).toHaveLength(2);
    });

    it('should apply only disclaimer when watermark disabled', async () => {
      await imagePostProcessingService.processImage(testImageBuffer, {
        applyWatermark: false,
        applyDisclaimer: true,
        watermarkText: 'DecorAI Brasil',
        disclaimerText: 'AI generated',
      });

      expect(mockComposite.mock.calls[0][0]).toHaveLength(1);
      // Only disclaimer (positioned at bottom)
      expect(mockComposite.mock.calls[0][0][0].top).toBeGreaterThan(0);
    });

    it('should return original buffer when no processing needed', async () => {
      const result = await imagePostProcessingService.processImage(testImageBuffer, {
        applyWatermark: false,
        applyDisclaimer: false,
        watermarkText: '',
        disclaimerText: '',
      });

      expect(result).toBe(testImageBuffer);
      expect(mockComposite).not.toHaveBeenCalled();
    });

    it('should handle different image resolutions (2048x2048)', async () => {
      mockMetadata.mockResolvedValue({ width: 2048, height: 2048 });

      await imagePostProcessingService.processImage(testImageBuffer, {
        applyWatermark: true,
        applyDisclaimer: true,
        watermarkText: 'DecorAI Brasil',
        disclaimerText: 'AI generated',
      });

      expect(mockComposite).toHaveBeenCalled();
      // Disclaimer position: 2048 - round(2048 * 0.025) = 2048 - 51 = 1997
      const disclaimerComposite = mockComposite.mock.calls[0][0][1];
      expect(disclaimerComposite.top).toBe(2048 - 51);
    });
  });

  describe('safeProcessImage', () => {
    it('should return processed buffer on success', async () => {
      const result = await imagePostProcessingService.safeProcessImage(testImageBuffer, {
        applyWatermark: true,
        applyDisclaimer: true,
        watermarkText: 'DecorAI Brasil',
        disclaimerText: 'AI generated',
      });

      expect(result.success).toBe(true);
      expect(result.buffer).toEqual(processedBuffer);
    });

    it('should return original buffer on failure (AC-7)', async () => {
      mockMetadata.mockRejectedValue(new Error('Sharp processing error'));

      const result = await imagePostProcessingService.safeProcessImage(testImageBuffer, {
        applyWatermark: true,
        applyDisclaimer: true,
        watermarkText: 'DecorAI Brasil',
        disclaimerText: 'AI generated',
      });

      expect(result.success).toBe(false);
      expect(result.buffer).toBe(testImageBuffer);
      expect(logger.error).toHaveBeenCalled();
    });
  });
});
