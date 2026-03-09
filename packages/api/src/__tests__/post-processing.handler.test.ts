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

vi.mock('../lib/supabase', () => ({
  supabaseAdmin: {
    from: vi.fn(),
    storage: {
      from: vi.fn().mockReturnValue({
        download: vi.fn(),
        upload: vi.fn(),
        createSignedUrl: vi.fn(),
      }),
    },
  },
  createUserClient: vi.fn(),
}));

vi.mock('../services/image-post-processing.service', () => ({
  imagePostProcessingService: {
    processImage: vi.fn(),
    applyWatermark: vi.fn(),
    applyDisclaimer: vi.fn(),
    safeProcessImage: vi.fn(),
    downloadImage: vi.fn(),
  },
}));

vi.mock('sharp', () => ({
  default: vi.fn().mockImplementation(() => ({
    metadata: vi.fn().mockResolvedValue({ width: 1024, height: 1024 }),
    composite: vi.fn().mockReturnValue({
      toBuffer: vi.fn().mockResolvedValue(Buffer.from('processed')),
    }),
    toBuffer: vi.fn().mockResolvedValue(Buffer.from('processed')),
  })),
}));

import { applyRenderPostProcessing } from '../queue/post-processing.handler';
import { watermarkService } from '../services/watermark.service';
import { logger } from '../lib/logger';

// Mock watermarkService methods
vi.spyOn(watermarkService, 'applyPostProcessing');

describe('applyRenderPostProcessing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should apply watermark for free tier users (AC-1)', async () => {
    vi.mocked(watermarkService.applyPostProcessing).mockResolvedValue({
      original_image_url: 'https://example.com/original.jpg',
      processed_image_url: 'https://example.com/processed.jpg',
      post_processing_failed: false,
    });

    const result = await applyRenderPostProcessing(
      'job-1',
      'https://example.com/original.jpg',
      'free',
    );

    expect(watermarkService.applyPostProcessing).toHaveBeenCalledWith(
      'https://example.com/original.jpg',
      'free',
    );
    expect(result.post_processing_applied).toBe(true);
    expect(result.result_image_url).toBe('https://example.com/processed.jpg');
    expect(result.original_image_url).toBe('https://example.com/original.jpg');
    expect(result.processed_image_url).toBe('https://example.com/processed.jpg');
  });

  it('should skip watermark for paid tier users (AC-1)', async () => {
    vi.mocked(watermarkService.applyPostProcessing).mockResolvedValue({
      original_image_url: 'https://example.com/original.jpg',
      processed_image_url: 'https://example.com/disclaimer-only.jpg',
      post_processing_failed: false,
    });

    const result = await applyRenderPostProcessing(
      'job-2',
      'https://example.com/original.jpg',
      'pro',
    );

    expect(watermarkService.applyPostProcessing).toHaveBeenCalledWith(
      'https://example.com/original.jpg',
      'pro',
    );
    expect(result.post_processing_applied).toBe(true);
  });

  it('should always apply disclaimer regardless of tier (AC-2)', async () => {
    vi.mocked(watermarkService.applyPostProcessing).mockResolvedValue({
      original_image_url: 'https://example.com/original.jpg',
      processed_image_url: 'https://example.com/processed.jpg',
      post_processing_failed: false,
    });

    // Free tier
    await applyRenderPostProcessing('job-3', 'https://example.com/original.jpg', 'free');
    expect(watermarkService.applyPostProcessing).toHaveBeenCalledWith(
      'https://example.com/original.jpg',
      'free',
    );

    // Business tier
    await applyRenderPostProcessing('job-4', 'https://example.com/original.jpg', 'business');
    expect(watermarkService.applyPostProcessing).toHaveBeenCalledWith(
      'https://example.com/original.jpg',
      'business',
    );
  });

  it('should preserve original image URL (AC-3)', async () => {
    vi.mocked(watermarkService.applyPostProcessing).mockResolvedValue({
      original_image_url: 'https://example.com/original.jpg',
      processed_image_url: 'https://example.com/processed.jpg',
      post_processing_failed: false,
    });

    const result = await applyRenderPostProcessing(
      'job-5',
      'https://example.com/original.jpg',
      'free',
    );

    expect(result.original_image_url).toBe('https://example.com/original.jpg');
    expect(result.processed_image_url).toBe('https://example.com/processed.jpg');
  });

  it('should fallback gracefully on processing error (AC-7)', async () => {
    vi.mocked(watermarkService.applyPostProcessing).mockResolvedValue({
      original_image_url: 'https://example.com/original.jpg',
      processed_image_url: 'https://example.com/original.jpg',
      post_processing_failed: true,
    });

    const result = await applyRenderPostProcessing(
      'job-6',
      'https://example.com/original.jpg',
      'free',
    );

    // Should still return a valid result (not throw)
    expect(result.post_processing_applied).toBe(false);
    expect(result.post_processing_failed).toBe(true);
    expect(result.result_image_url).toBe('https://example.com/original.jpg');
    expect(result.processed_image_url).toBeNull();
    expect(logger.warn).toHaveBeenCalled();
  });
});
