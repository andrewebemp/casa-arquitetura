import { describe, it, expect, vi, beforeEach } from 'vitest';

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

vi.mock('../lib/logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
  },
}));

vi.mock('../lib/ai-pipeline.client', () => ({
  aiPipelineClient: {
    segment: vi.fn(),
    inpaint: vi.fn(),
  },
}));

import { inpaintingService } from '../services/inpainting.service';
import { aiPipelineClient } from '../lib/ai-pipeline.client';

const mockSegment = vi.mocked(aiPipelineClient.segment);
const mockInpaint = vi.mocked(aiPipelineClient.inpaint);

describe('inpainting-service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('buildPrompt', () => {
    it('should build a prompt from material descriptor', () => {
      const { prompt, negativePrompt } = inpaintingService.buildPrompt('dark hardwood floor');
      expect(prompt).toContain('dark hardwood floor');
      expect(prompt).toContain('photorealistic');
      expect(negativePrompt).toContain('low quality');
      expect(negativePrompt).toContain('artifacts');
    });
  });

  describe('swapMaterial', () => {
    it('should re-segment, find target, and call inpaint', async () => {
      mockSegment.mockResolvedValue({
        segments: [
          {
            segment_id: 'seg-1',
            label: 'floor',
            mask_url: 'https://storage.com/mask-floor.png',
            polygon: [{ x: 0, y: 0 }],
            bounding_box: { x: 0, y: 0, width: 100, height: 100 },
            confidence: 0.9,
          },
        ],
        provider: 'fal',
        inference_time_ms: 800,
      });

      mockInpaint.mockResolvedValue({
        result_image_url: 'https://storage.com/result.jpg',
        metadata: {
          model: 'sdxl-inpaint',
          inference_time_ms: 5000,
          provider: 'fal',
        },
      });

      const result = await inpaintingService.swapMaterial({
        imageUrl: 'https://example.com/image.jpg',
        segmentId: 'seg-1',
        materialDescriptor: 'dark hardwood floor',
      });

      expect(result.result_image_url).toBe('https://storage.com/result.jpg');
      expect(result.provider).toBe('fal');
      expect(mockSegment).toHaveBeenCalledWith({
        image_url: 'https://example.com/image.jpg',
        mode: 'auto',
      });
      expect(mockInpaint).toHaveBeenCalledWith(
        expect.objectContaining({
          image_url: 'https://example.com/image.jpg',
          mask_url: 'https://storage.com/mask-floor.png',
        }),
      );
    });

    it('should throw when segment not found and no fallback mask', async () => {
      mockSegment.mockResolvedValue({
        segments: [],
        provider: 'fal',
        inference_time_ms: 800,
      });

      await expect(
        inpaintingService.swapMaterial({
          imageUrl: 'https://example.com/image.jpg',
          segmentId: 'nonexistent',
          materialDescriptor: 'white marble',
        }),
      ).rejects.toThrow('Segment nonexistent not found in image');
    });

    it('should use provided maskUrl as fallback', async () => {
      mockSegment.mockResolvedValue({
        segments: [],
        provider: 'fal',
        inference_time_ms: 800,
      });

      mockInpaint.mockResolvedValue({
        result_image_url: 'https://storage.com/result2.jpg',
        metadata: {
          model: 'sdxl-inpaint',
          inference_time_ms: 4000,
          provider: 'replicate',
        },
      });

      const result = await inpaintingService.swapMaterial({
        imageUrl: 'https://example.com/image.jpg',
        segmentId: 'seg-fallback',
        materialDescriptor: 'white marble countertop',
        maskUrl: 'https://storage.com/fallback-mask.png',
      });

      expect(result.result_image_url).toBe('https://storage.com/result2.jpg');
      expect(mockInpaint).toHaveBeenCalledWith(
        expect.objectContaining({
          mask_url: 'https://storage.com/fallback-mask.png',
        }),
      );
    });
  });
});
