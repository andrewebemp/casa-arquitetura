import { createHash } from 'node:crypto';
import { getRedisClient } from '../lib/redis';
import { logger } from '../lib/logger';

const CACHE_PREFIX = 'rendercache:';
const SLIDING_TTL_SECONDS = 7 * 24 * 3600; // 7 days
const MAX_TTL_SECONDS = 30 * 24 * 3600; // 30 days absolute

interface CacheKeyParams {
  sourceImageHash: string;
  styleId: string;
  width: number;
  height: number;
  seed: number;
  promptHash: string;
}

interface CachedRender {
  resultImageUrl: string;
  originalImageUrl: string;
  processedImageUrl: string;
  depthMapUrl: string;
  metadata: Record<string, unknown>;
  createdAt: number;
  accessCount: number;
}

interface CacheStats {
  hitRate: number;
  totalEntries: number;
  memoryUsageBytes: number;
  topCached: Array<{ hash: string; accessCount: number; createdAt: number }>;
}

const STATS_KEY = 'rendercache:stats';

export const semanticCacheService = {
  computeHash(params: CacheKeyParams): string {
    const normalized = [
      params.sourceImageHash,
      params.styleId,
      `${params.width}x${params.height}`,
      String(params.seed),
      params.promptHash,
    ].join(':');

    return createHash('sha256').update(normalized).digest('hex');
  },

  async get(hash: string): Promise<CachedRender | null> {
    try {
      const redis = getRedisClient();
      const key = `${CACHE_PREFIX}${hash}`;
      const data = await redis.get(key);

      if (!data) {
        await this.incrementStats('misses');
        return null;
      }

      const cached = JSON.parse(data) as CachedRender;

      // Check absolute TTL (30 days from creation)
      const ageSeconds = (Date.now() - cached.createdAt) / 1000;
      if (ageSeconds > MAX_TTL_SECONDS) {
        await redis.del(key);
        await this.incrementStats('misses');
        return null;
      }

      // Refresh sliding TTL on access
      await redis.expire(key, SLIDING_TTL_SECONDS);

      // Increment access count
      cached.accessCount = (cached.accessCount || 0) + 1;
      await redis.set(key, JSON.stringify(cached), 'EX', SLIDING_TTL_SECONDS);

      await this.incrementStats('hits');
      return cached;
    } catch (err) {
      logger.error({ err, hash }, 'Failed to get from semantic cache');
      return null;
    }
  },

  async set(hash: string, render: Omit<CachedRender, 'createdAt' | 'accessCount'>): Promise<void> {
    try {
      const redis = getRedisClient();
      const key = `${CACHE_PREFIX}${hash}`;

      const entry: CachedRender = {
        ...render,
        createdAt: Date.now(),
        accessCount: 0,
      };

      await redis.set(key, JSON.stringify(entry), 'EX', SLIDING_TTL_SECONDS);
      logger.info({ hash }, 'Stored render in semantic cache');
    } catch (err) {
      logger.error({ err, hash }, 'Failed to set semantic cache');
    }
  },

  async invalidate(hash: string): Promise<boolean> {
    try {
      const redis = getRedisClient();
      const key = `${CACHE_PREFIX}${hash}`;
      const deleted = await redis.del(key);
      return deleted > 0;
    } catch (err) {
      logger.error({ err, hash }, 'Failed to invalidate semantic cache entry');
      return false;
    }
  },

  async getStats(): Promise<CacheStats> {
    try {
      const redis = getRedisClient();

      // Get hit/miss counters
      const statsData = await redis.get(STATS_KEY);
      const stats = statsData ? JSON.parse(statsData) : { hits: 0, misses: 0 };

      // Scan for all cache entries
      const entries: Array<{ hash: string; accessCount: number; createdAt: number }> = [];
      let cursor = '0';
      do {
        const [nextCursor, keys] = await redis.scan(
          cursor,
          'MATCH',
          `${CACHE_PREFIX}*`,
          'COUNT',
          100,
        );
        cursor = nextCursor;

        for (const key of keys) {
          if (key === STATS_KEY) continue;
          const data = await redis.get(key);
          if (data) {
            const parsed = JSON.parse(data) as CachedRender;
            entries.push({
              hash: key.replace(CACHE_PREFIX, ''),
              accessCount: parsed.accessCount || 0,
              createdAt: parsed.createdAt,
            });
          }
        }
      } while (cursor !== '0');

      // Get memory usage from Redis INFO
      const info = await redis.info('memory');
      const memMatch = info.match(/used_memory:(\d+)/);
      const memoryUsageBytes = memMatch ? parseInt(memMatch[1], 10) : 0;

      // Sort by access count descending for top cached
      entries.sort((a, b) => b.accessCount - a.accessCount);

      const totalRequests = stats.hits + stats.misses;
      const hitRate = totalRequests > 0 ? stats.hits / totalRequests : 0;

      return {
        hitRate,
        totalEntries: entries.length,
        memoryUsageBytes,
        topCached: entries.slice(0, 10),
      };
    } catch (err) {
      logger.error({ err }, 'Failed to get cache stats');
      return { hitRate: 0, totalEntries: 0, memoryUsageBytes: 0, topCached: [] };
    }
  },

  async incrementStats(type: 'hits' | 'misses'): Promise<void> {
    try {
      const redis = getRedisClient();
      const statsData = await redis.get(STATS_KEY);
      const stats = statsData ? JSON.parse(statsData) : { hits: 0, misses: 0 };
      stats[type] += 1;
      await redis.set(STATS_KEY, JSON.stringify(stats));
    } catch {
      // Stats tracking is best-effort
    }
  },
};
