import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../lib/supabase', () => ({
  supabaseAdmin: {
    from: vi.fn(),
    storage: {
      from: vi.fn().mockReturnValue({
        createSignedUrl: vi.fn(),
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

import { watermarkService } from '../services/watermark.service';
import { supabaseAdmin } from '../lib/supabase';

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
      });

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
      });

      const result = await watermarkService.getImageUrl(
        'user-123/proj-123/original.jpg',
        false,
      );

      expect(result.url).toBe('user-123/proj-123/original.jpg');
    });
  });
});
