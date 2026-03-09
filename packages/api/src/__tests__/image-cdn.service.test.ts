import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockCreateSignedUrl = vi.fn();

vi.mock('../lib/supabase', () => ({
  supabaseAdmin: {
    storage: {
      from: vi.fn(() => ({
        createSignedUrl: mockCreateSignedUrl,
      })),
    },
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

vi.mock('../config/env', () => ({
  env: {
    SUPABASE_URL: 'https://test.supabase.co',
    SUPABASE_ANON_KEY: 'test-anon-key',
    SUPABASE_SERVICE_ROLE_KEY: 'test-service-key',
    REDIS_URL: 'redis://localhost:6379',
    PORT: 3001,
    NODE_ENV: 'test',
    CORS_ORIGINS: 'http://localhost:3000',
    CDN_BASE_URL: 'https://cdn.decorai.com.br',
  },
}));

import { imageCdnService } from '../services/image-cdn.service';

describe('imageCdnService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getCdnBaseUrl', () => {
    it('should return CDN base URL from env', () => {
      const url = imageCdnService.getCdnBaseUrl();
      expect(url).toBe('https://cdn.decorai.com.br');
    });
  });

  describe('rewriteToCdnUrl', () => {
    it('should replace Supabase host with CDN host', () => {
      const supabaseUrl = 'https://test.supabase.co/storage/v1/object/sign/project-images/user1/proj1/render.jpg?token=abc';
      const cdnUrl = imageCdnService.rewriteToCdnUrl(supabaseUrl);
      expect(cdnUrl).toBe('https://cdn.decorai.com.br/storage/v1/object/sign/project-images/user1/proj1/render.jpg?token=abc');
    });

    it('should return original URL when CDN base is empty', () => {
      // Override CDN_BASE_URL temporarily
      const original = imageCdnService.getCdnBaseUrl;
      imageCdnService.getCdnBaseUrl = () => '';

      const url = 'https://test.supabase.co/storage/render.jpg';
      expect(imageCdnService.rewriteToCdnUrl(url)).toBe(url);

      imageCdnService.getCdnBaseUrl = original;
    });

    it('should handle malformed URLs gracefully', () => {
      const result = imageCdnService.rewriteToCdnUrl('not-a-url');
      expect(result).toBe('not-a-url');
    });
  });

  describe('generateSignedUrl', () => {
    it('should generate signed URL with 30-day TTL for public images', async () => {
      mockCreateSignedUrl.mockResolvedValue({
        data: { signedUrl: 'https://test.supabase.co/storage/v1/object/sign/project-images/path?token=abc' },
        error: null,
      });

      const url = await imageCdnService.generateSignedUrl({
        storagePath: 'user1/proj1/render.jpg',
        isPublic: true,
      });

      expect(mockCreateSignedUrl).toHaveBeenCalledWith('user1/proj1/render.jpg', 30 * 24 * 3600);
      expect(url).toContain('cdn.decorai.com.br');
    });

    it('should generate signed URL with 24-hour TTL for authenticated images', async () => {
      mockCreateSignedUrl.mockResolvedValue({
        data: { signedUrl: 'https://test.supabase.co/storage/v1/object/sign/project-images/path?token=xyz' },
        error: null,
      });

      const url = await imageCdnService.generateSignedUrl({
        storagePath: 'user1/proj1/render.jpg',
        isPublic: false,
      });

      expect(mockCreateSignedUrl).toHaveBeenCalledWith('user1/proj1/render.jpg', 24 * 3600);
      expect(url).toContain('cdn.decorai.com.br');
    });

    it('should return storage path when signed URL fails', async () => {
      mockCreateSignedUrl.mockResolvedValue({
        data: null,
        error: new Error('Sign failed'),
      });

      const url = await imageCdnService.generateSignedUrl({
        storagePath: 'user1/proj1/render.jpg',
        isPublic: false,
      });

      expect(url).toBe('user1/proj1/render.jpg');
    });
  });

  describe('generateCacheHeaders', () => {
    it('should generate public cache headers for public images', () => {
      const headers = imageCdnService.generateCacheHeaders({
        isPublic: true,
        etag: 'abc123',
      });

      expect(headers['Cache-Control']).toContain('public');
      expect(headers['Cache-Control']).toContain('immutable');
      expect(headers['ETag']).toBe('"abc123"');
      expect(headers['CDN-Cache-Control']).toBeDefined();
    });

    it('should generate private cache headers for authenticated images', () => {
      const headers = imageCdnService.generateCacheHeaders({
        isPublic: false,
        etag: 'xyz789',
      });

      expect(headers['Cache-Control']).toContain('private');
      expect(headers['Cache-Control']).toContain('must-revalidate');
      expect(headers['ETag']).toBe('"xyz789"');
    });
  });

  describe('generateETag', () => {
    it('should produce deterministic ETag', () => {
      const etag1 = imageCdnService.generateETag('content-hash-1');
      const etag2 = imageCdnService.generateETag('content-hash-1');

      expect(etag1).toBe(etag2);
      expect(etag1).toHaveLength(16);
    });

    it('should produce different ETags for different content', () => {
      const etag1 = imageCdnService.generateETag('content-1');
      const etag2 = imageCdnService.generateETag('content-2');

      expect(etag1).not.toBe(etag2);
    });
  });

  describe('getPublicImageUrl', () => {
    it('should call generateSignedUrl with isPublic true', async () => {
      mockCreateSignedUrl.mockResolvedValue({
        data: { signedUrl: 'https://test.supabase.co/path?token=pub' },
        error: null,
      });

      await imageCdnService.getPublicImageUrl('user1/proj1/render.jpg');

      expect(mockCreateSignedUrl).toHaveBeenCalledWith('user1/proj1/render.jpg', 30 * 24 * 3600);
    });
  });

  describe('getAuthenticatedImageUrl', () => {
    it('should call generateSignedUrl with isPublic false', async () => {
      mockCreateSignedUrl.mockResolvedValue({
        data: { signedUrl: 'https://test.supabase.co/path?token=auth' },
        error: null,
      });

      await imageCdnService.getAuthenticatedImageUrl('user1/proj1/render.jpg');

      expect(mockCreateSignedUrl).toHaveBeenCalledWith('user1/proj1/render.jpg', 24 * 3600);
    });
  });
});
