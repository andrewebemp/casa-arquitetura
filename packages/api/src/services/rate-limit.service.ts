import { getRedisClient } from '../lib/redis';
import { logger } from '../lib/logger';
import { RATE_LIMITS } from '@decorai/shared';
import type { SubscriptionTier } from '@decorai/shared';

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
}

type TierOrAnonymous = SubscriptionTier | 'anonymous';

const getWindowKey = (identifier: string, isIp: boolean): string => {
  const windowMinute = Math.floor(Date.now() / 60000);
  const prefix = isIp ? 'ratelimit:ip' : 'ratelimit';
  return `${prefix}:${identifier}:${windowMinute}`;
};

const getWindowResetAt = (): number => {
  const currentMinute = Math.floor(Date.now() / 60000);
  return (currentMinute + 1) * 60000;
};

export const rateLimitService = {
  async checkAndIncrement(
    identifier: string,
    tier: TierOrAnonymous,
    isIp: boolean = false,
  ): Promise<RateLimitResult> {
    const config = RATE_LIMITS[tier];
    const limit = config.requestsPerMinute;
    const resetAt = getWindowResetAt();

    try {
      const redis = getRedisClient();
      const key = getWindowKey(identifier, isIp);

      const pipeline = redis.multi();
      pipeline.incr(key);
      pipeline.expire(key, 60);
      const results = await pipeline.exec();

      if (!results || results.length === 0) {
        return { allowed: true, limit, remaining: limit - 1, resetAt };
      }

      const [incrErr, currentCount] = results[0];
      if (incrErr) {
        logger.warn({ err: incrErr }, 'Redis INCR error in rate limiter, failing open');
        return { allowed: true, limit, remaining: limit - 1, resetAt };
      }

      const count = currentCount as number;
      const remaining = Math.max(0, limit - count);
      const allowed = count <= limit;

      return { allowed, limit, remaining, resetAt };
    } catch (err) {
      logger.warn({ err }, 'Redis unavailable for rate limiting, failing open');
      return { allowed: true, limit, remaining: limit - 1, resetAt };
    }
  },

  async getRemaining(
    identifier: string,
    tier: TierOrAnonymous,
    isIp: boolean = false,
  ): Promise<RateLimitResult> {
    const config = RATE_LIMITS[tier];
    const limit = config.requestsPerMinute;
    const resetAt = getWindowResetAt();

    try {
      const redis = getRedisClient();
      const key = getWindowKey(identifier, isIp);
      const countStr = await redis.get(key);
      const count = countStr ? parseInt(countStr, 10) : 0;
      const remaining = Math.max(0, limit - count);

      return { allowed: remaining > 0, limit, remaining, resetAt };
    } catch (err) {
      logger.warn({ err }, 'Redis unavailable for rate limit check, failing open');
      return { allowed: true, limit, remaining: limit, resetAt };
    }
  },
};
