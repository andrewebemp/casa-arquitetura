import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../lib/supabase', () => ({
  supabaseAdmin: {
    from: vi.fn(),
    storage: {
      from: vi.fn().mockReturnValue({
        createSignedUrl: vi.fn(),
        download: vi.fn(),
        upload: vi.fn(),
      }),
    },
  },
  createUserClient: vi.fn(),
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
    ANTHROPIC_API_KEY: 'test-anthropic-key',
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

vi.mock('../services/image-post-processing.service', () => ({
  imagePostProcessingService: {
    processImage: vi.fn().mockResolvedValue(Buffer.from('processed-image')),
    applyWatermark: vi.fn(),
    applyDisclaimer: vi.fn(),
    safeProcessImage: vi.fn(),
    downloadImage: vi.fn(),
  },
}));

vi.mock('sharp', () => ({
  default: vi.fn(),
}));

import { watermarkService } from '../services/watermark.service';
import { supabaseAdmin } from '../lib/supabase';
import { imagePostProcessingService } from '../services/image-post-processing.service';
import { logger } from '../lib/logger';

const mockStorage = vi.mocked(supabaseAdmin.storage);

describe('watermarkService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('shouldApplyWatermark', () => {
    it('should return true when includeWatermark is true', () => {
      expect(watermarkService.shouldApplyWatermark(true)).toBe(true);
    });

    it('should return false when includeWatermark is false', () => {
      expect(watermarkService.shouldApplyWatermark(false)).toBe(false);
    });
  });

  describe('getWatermarkInfo', () => {
    it('should return watermark metadata for free tier (watermark enabled)', () => {
      const info = watermarkService.getWatermarkInfo(true);

      expect(info).not.toBeNull();
      expect(info!.enabled).toBe(true);
      expect(info!.text).toBe('DecorAI Brasil');
      expect(info!.position).toBe('bottom-right');
      expect(info!.opacity).toBe(0.5);
    });

    it('should return null for paid tier (no watermark)', () => {
      const info = watermarkService.getWatermarkInfo(false);

      expect(info).toBeNull();
    });
  });

  describe('getImageUrl', () => {
    it('should return URL with watermark info when watermark enabled', async () => {
      const result = await watermarkService.getImageUrl(
        'https://storage.example.com/image.jpg',
        true,
      );

      expect(result.url).toBe('https://storage.example.com/image.jpg');
      expect(result.watermark).not.toBeNull();
      expect(result.watermark!.enabled).toBe(true);
    });

    it('should return URL without watermark info when watermark disabled', async () => {
      const result = await watermarkService.getImageUrl(
        'https://storage.example.com/image.jpg',
        false,
      );

      expect(result.url).toBe('https://storage.example.com/image.jpg');
      expect(result.watermark).toBeNull();
    });

    it('should create signed URL for storage paths', async () => {
      mockStorage.from.mockReturnValue({
        createSignedUrl: vi.fn().mockResolvedValue({
          data: { signedUrl: 'https://signed.example.com/image.jpg' },
          error: null,
        }),
      } as never);

      const result = await watermarkService.getImageUrl(
        'user-123/proj-123/original.jpg',
        true,
      );

      expect(result.url).toBe('https://signed.example.com/image.jpg');
      expect(mockStorage.from).toHaveBeenCalledWith('project-images');
    });

    it('should fallback to original path on signed URL error', async () => {
      mockStorage.from.mockReturnValue({
        createSignedUrl: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Storage error' },
        }),
      } as never);

      const result = await watermarkService.getImageUrl(
        'user-123/proj-123/original.jpg',
        false,
      );

      expect(result.url).toBe('user-123/proj-123/original.jpg');
    });
  });

  describe('applyPostProcessing', () => {
    it('should apply watermark for free tier', async () => {
      // Mock global fetch for image download
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(10)),
      });
      vi.stubGlobal('fetch', mockFetch);

      mockStorage.from.mockReturnValue({
        upload: vi.fn().mockResolvedValue({ error: null }),
        createSignedUrl: vi.fn().mockResolvedValue({
          data: { signedUrl: 'https://signed.example.com/processed.jpg' },
          error: null,
        }),
        download: vi.fn(),
      } as never);

      const result = await watermarkService.applyPostProcessing(
        'https://example.com/image.jpg',
        'free',
      );

      expect(imagePostProcessingService.processImage).toHaveBeenCalledWith(
        expect.any(Buffer),
        expect.objectContaining({
          applyWatermark: true,
          applyDisclaimer: true,
        }),
      );
      expect(result.original_image_url).toBe('https://example.com/image.jpg');
      expect(result.post_processing_failed).toBe(false);

      vi.unstubAllGlobals();
    });

    it('should skip watermark for pro tier', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(10)),
      });
      vi.stubGlobal('fetch', mockFetch);

      mockStorage.from.mockReturnValue({
        upload: vi.fn().mockResolvedValue({ error: null }),
        createSignedUrl: vi.fn().mockResolvedValue({
          data: { signedUrl: 'https://signed.example.com/processed.jpg' },
          error: null,
        }),
        download: vi.fn(),
      } as never);

      await watermarkService.applyPostProcessing(
        'https://example.com/image.jpg',
        'pro',
      );

      expect(imagePostProcessingService.processImage).toHaveBeenCalledWith(
        expect.any(Buffer),
        expect.objectContaining({
          applyWatermark: false,
          applyDisclaimer: true,
        }),
      );

      vi.unstubAllGlobals();
    });

    it('should handle errors gracefully (AC-7)', async () => {
      const mockFetch = vi.fn().mockRejectedValue(new Error('Network error'));
      vi.stubGlobal('fetch', mockFetch);

      const result = await watermarkService.applyPostProcessing(
        'https://example.com/image.jpg',
        'free',
      );

      expect(result.post_processing_failed).toBe(true);
      expect(result.original_image_url).toBe('https://example.com/image.jpg');
      expect(result.processed_image_url).toBe('https://example.com/image.jpg');
      expect(logger.error).toHaveBeenCalled();

      vi.unstubAllGlobals();
    });
  });

  describe('getImageUrlForTier', () => {
    it('should return processed URL for free tier (AC-6)', () => {
      const url = watermarkService.getImageUrlForTier(
        'https://example.com/original.jpg',
        'https://example.com/processed.jpg',
        'free',
      );

      expect(url).toBe('https://example.com/processed.jpg');
    });

    it('should return original URL for pro tier (AC-6)', () => {
      const url = watermarkService.getImageUrlForTier(
        'https://example.com/original.jpg',
        'https://example.com/processed.jpg',
        'pro',
      );

      expect(url).toBe('https://example.com/original.jpg');
    });

    it('should return original URL for business tier (AC-6)', () => {
      const url = watermarkService.getImageUrlForTier(
        'https://example.com/original.jpg',
        'https://example.com/processed.jpg',
        'business',
      );

      expect(url).toBe('https://example.com/original.jpg');
    });

    it('should fallback when URLs are undefined', () => {
      expect(watermarkService.getImageUrlForTier(undefined, 'processed.jpg', 'free'))
        .toBe('processed.jpg');
      expect(watermarkService.getImageUrlForTier('original.jpg', undefined, 'free'))
        .toBe('original.jpg');
      expect(watermarkService.getImageUrlForTier(undefined, undefined, 'free'))
        .toBe('');
    });
  });
});
