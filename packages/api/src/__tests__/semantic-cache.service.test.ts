import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockGet = vi.fn();
const mockSet = vi.fn();
const mockDel = vi.fn();
const mockExpire = vi.fn();
const mockScan = vi.fn();
const mockInfo = vi.fn();

vi.mock('../lib/redis', () => ({
  getRedisClient: vi.fn(() => ({
    get: mockGet,
    set: mockSet,
    del: mockDel,
    expire: mockExpire,
    scan: mockScan,
    info: mockInfo,
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
    CDN_BASE_URL: '',
  },
}));

import { semanticCacheService } from '../services/semantic-cache.service';

describe('semanticCacheService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('computeHash', () => {
    it('should produce deterministic SHA-256 hash from params', () => {
      const params = {
        sourceImageHash: 'abc123',
        styleId: 'moderno',
        width: 1024,
        height: 1024,
        seed: 42,
        promptHash: 'def456',
      };

      const hash1 = semanticCacheService.computeHash(params);
      const hash2 = semanticCacheService.computeHash(params);

      expect(hash1).toBe(hash2);
      expect(hash1).toMatch(/^[a-f0-9]{64}$/);
    });

    it('should produce different hashes for different params', () => {
      const base = {
        sourceImageHash: 'abc123',
        styleId: 'moderno',
        width: 1024,
        height: 1024,
        seed: 42,
        promptHash: 'def456',
      };

      const hash1 = semanticCacheService.computeHash(base);
      const hash2 = semanticCacheService.computeHash({ ...base, styleId: 'industrial' });
      const hash3 = semanticCacheService.computeHash({ ...base, seed: 99 });
      const hash4 = semanticCacheService.computeHash({ ...base, width: 2048 });

      expect(hash1).not.toBe(hash2);
      expect(hash1).not.toBe(hash3);
      expect(hash1).not.toBe(hash4);
      expect(hash2).not.toBe(hash3);
    });

    it('should produce same hash regardless of param order', () => {
      const params1 = {
        sourceImageHash: 'img1',
        styleId: 'minimalist',
        width: 512,
        height: 512,
        seed: 1,
        promptHash: 'ph1',
      };

      const params2 = {
        promptHash: 'ph1',
        seed: 1,
        height: 512,
        width: 512,
        styleId: 'minimalist',
        sourceImageHash: 'img1',
      };

      expect(semanticCacheService.computeHash(params1))
        .toBe(semanticCacheService.computeHash(params2));
    });
  });

  describe('get', () => {
    it('should return null on cache miss', async () => {
      mockGet.mockResolvedValueOnce(null);
      // Stats get for incrementStats
      mockGet.mockResolvedValueOnce(JSON.stringify({ hits: 0, misses: 0 }));
      mockSet.mockResolvedValue('OK');

      const result = await semanticCacheService.get('nonexistenthash');

      expect(result).toBeNull();
    });

    it('should return cached render on cache hit', async () => {
      const cached = {
        resultImageUrl: 'https://cdn.example.com/render.jpg',
        originalImageUrl: 'https://cdn.example.com/original.jpg',
        processedImageUrl: 'https://cdn.example.com/processed.jpg',
        depthMapUrl: 'https://cdn.example.com/depth.jpg',
        metadata: { provider: 'fal.ai' },
        createdAt: Date.now() - 1000,
        accessCount: 5,
      };

      mockGet.mockResolvedValueOnce(JSON.stringify(cached));
      mockExpire.mockResolvedValue(1);
      mockSet.mockResolvedValue('OK');
      // Stats get for incrementStats
      mockGet.mockResolvedValueOnce(JSON.stringify({ hits: 0, misses: 0 }));

      const result = await semanticCacheService.get('validhash');

      expect(result).not.toBeNull();
      expect(result!.resultImageUrl).toBe('https://cdn.example.com/render.jpg');
      expect(result!.accessCount).toBe(6);
      expect(mockExpire).toHaveBeenCalledWith('rendercache:validhash', 7 * 24 * 3600);
    });

    it('should evict entries older than 30 days (absolute TTL)', async () => {
      const cached = {
        resultImageUrl: 'https://cdn.example.com/render.jpg',
        originalImageUrl: '',
        processedImageUrl: '',
        depthMapUrl: '',
        metadata: {},
        createdAt: Date.now() - (31 * 24 * 3600 * 1000), // 31 days ago
        accessCount: 10,
      };

      mockGet.mockResolvedValueOnce(JSON.stringify(cached));
      mockDel.mockResolvedValue(1);
      // Stats get for incrementStats
      mockGet.mockResolvedValueOnce(JSON.stringify({ hits: 0, misses: 0 }));
      mockSet.mockResolvedValue('OK');

      const result = await semanticCacheService.get('oldhash');

      expect(result).toBeNull();
      expect(mockDel).toHaveBeenCalledWith('rendercache:oldhash');
    });

    it('should return null and log error when Redis throws', async () => {
      mockGet.mockRejectedValue(new Error('Redis down'));

      const result = await semanticCacheService.get('hash');

      expect(result).toBeNull();
    });
  });

  describe('set', () => {
    it('should store render in Redis with 7-day TTL', async () => {
      mockSet.mockResolvedValue('OK');

      await semanticCacheService.set('testhash', {
        resultImageUrl: 'https://cdn.example.com/render.jpg',
        originalImageUrl: 'https://cdn.example.com/original.jpg',
        processedImageUrl: 'https://cdn.example.com/processed.jpg',
        depthMapUrl: 'https://cdn.example.com/depth.jpg',
        metadata: { provider: 'replicate' },
      });

      expect(mockSet).toHaveBeenCalledWith(
        'rendercache:testhash',
        expect.any(String),
        'EX',
        7 * 24 * 3600,
      );

      const storedData = JSON.parse(mockSet.mock.calls[0][1]);
      expect(storedData.resultImageUrl).toBe('https://cdn.example.com/render.jpg');
      expect(storedData.createdAt).toBeGreaterThan(0);
      expect(storedData.accessCount).toBe(0);
    });

    it('should not throw when Redis fails', async () => {
      mockSet.mockRejectedValue(new Error('Redis down'));

      await expect(
        semanticCacheService.set('hash', {
          resultImageUrl: '',
          originalImageUrl: '',
          processedImageUrl: '',
          depthMapUrl: '',
          metadata: {},
        }),
      ).resolves.not.toThrow();
    });
  });

  describe('invalidate', () => {
    it('should delete cache entry and return true', async () => {
      mockDel.mockResolvedValue(1);

      const result = await semanticCacheService.invalidate('testhash');

      expect(result).toBe(true);
      expect(mockDel).toHaveBeenCalledWith('rendercache:testhash');
    });

    it('should return false when entry does not exist', async () => {
      mockDel.mockResolvedValue(0);

      const result = await semanticCacheService.invalidate('nonexistent');

      expect(result).toBe(false);
    });

    it('should return false when Redis throws', async () => {
      mockDel.mockRejectedValue(new Error('Redis down'));

      const result = await semanticCacheService.invalidate('hash');

      expect(result).toBe(false);
    });
  });

  describe('getStats', () => {
    it('should return cache statistics', async () => {
      const statsData = JSON.stringify({ hits: 100, misses: 25 });
      mockGet.mockResolvedValueOnce(statsData);

      const cacheEntry = JSON.stringify({
        resultImageUrl: 'url',
        createdAt: Date.now(),
        accessCount: 10,
      });

      mockScan.mockResolvedValueOnce(['0', ['rendercache:hash1']]);
      mockGet.mockResolvedValueOnce(cacheEntry);
      mockInfo.mockResolvedValueOnce('used_memory:1048576\r\nused_memory_human:1M');

      const stats = await semanticCacheService.getStats();

      expect(stats.hitRate).toBe(0.8); // 100 / 125
      expect(stats.totalEntries).toBe(1);
      expect(stats.memoryUsageBytes).toBe(1048576);
      expect(stats.topCached).toHaveLength(1);
    });

    it('should return zeros when Redis is empty', async () => {
      mockGet.mockResolvedValueOnce(null);
      mockScan.mockResolvedValueOnce(['0', []]);
      mockInfo.mockResolvedValueOnce('used_memory:0\r\n');

      const stats = await semanticCacheService.getStats();

      expect(stats.hitRate).toBe(0);
      expect(stats.totalEntries).toBe(0);
    });

    it('should return default stats when Redis throws', async () => {
      mockGet.mockRejectedValue(new Error('Redis down'));

      const stats = await semanticCacheService.getStats();

      expect(stats.hitRate).toBe(0);
      expect(stats.totalEntries).toBe(0);
      expect(stats.topCached).toEqual([]);
    });
  });
});
