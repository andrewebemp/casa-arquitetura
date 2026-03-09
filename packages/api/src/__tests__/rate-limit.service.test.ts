import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockIncr = vi.fn();
const mockExpire = vi.fn();
const mockExec = vi.fn();
const mockGet = vi.fn();
const mockMulti = vi.fn(() => ({
  incr: mockIncr,
  expire: mockExpire,
  exec: mockExec,
}));

vi.mock('../lib/redis', () => ({
  getRedisClient: vi.fn(() => ({
    multi: mockMulti,
    get: mockGet,
  })),
}));

vi.mock('../lib/logger', () => ({
  logger: {
    warn: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
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

import { rateLimitService } from '../services/rate-limit.service';

describe('rateLimitService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('checkAndIncrement', () => {
    it('should allow request when under the limit for free tier', async () => {
      mockExec.mockResolvedValue([[null, 5], [null, 1]]);

      const result = await rateLimitService.checkAndIncrement('user-123', 'free', false);

      expect(result.allowed).toBe(true);
      expect(result.limit).toBe(10);
      expect(result.remaining).toBe(5);
      expect(mockMulti).toHaveBeenCalled();
      expect(mockIncr).toHaveBeenCalled();
      expect(mockExpire).toHaveBeenCalled();
    });

    it('should deny request when at the limit for free tier', async () => {
      mockExec.mockResolvedValue([[null, 11], [null, 1]]);

      const result = await rateLimitService.checkAndIncrement('user-123', 'free', false);

      expect(result.allowed).toBe(false);
      expect(result.limit).toBe(10);
      expect(result.remaining).toBe(0);
    });

    it('should allow request at exactly the limit for free tier', async () => {
      mockExec.mockResolvedValue([[null, 10], [null, 1]]);

      const result = await rateLimitService.checkAndIncrement('user-123', 'free', false);

      expect(result.allowed).toBe(true);
      expect(result.limit).toBe(10);
      expect(result.remaining).toBe(0);
    });

    it('should use pro tier limits (60 req/min)', async () => {
      mockExec.mockResolvedValue([[null, 30], [null, 1]]);

      const result = await rateLimitService.checkAndIncrement('user-456', 'pro', false);

      expect(result.allowed).toBe(true);
      expect(result.limit).toBe(60);
      expect(result.remaining).toBe(30);
    });

    it('should use business tier limits (120 req/min)', async () => {
      mockExec.mockResolvedValue([[null, 100], [null, 1]]);

      const result = await rateLimitService.checkAndIncrement('user-789', 'business', false);

      expect(result.allowed).toBe(true);
      expect(result.limit).toBe(120);
      expect(result.remaining).toBe(20);
    });

    it('should use anonymous limits (30 req/min) for IP-based requests', async () => {
      mockExec.mockResolvedValue([[null, 25], [null, 1]]);

      const result = await rateLimitService.checkAndIncrement('192.168.1.1', 'anonymous', true);

      expect(result.allowed).toBe(true);
      expect(result.limit).toBe(30);
      expect(result.remaining).toBe(5);
    });

    it('should fail open when Redis throws an error', async () => {
      mockExec.mockRejectedValue(new Error('Redis connection failed'));

      const result = await rateLimitService.checkAndIncrement('user-123', 'free', false);

      expect(result.allowed).toBe(true);
      expect(result.limit).toBe(10);
      expect(result.remaining).toBe(9);
    });

    it('should fail open when Redis MULTI returns null results', async () => {
      mockExec.mockResolvedValue(null);

      const result = await rateLimitService.checkAndIncrement('user-123', 'free', false);

      expect(result.allowed).toBe(true);
      expect(result.limit).toBe(10);
      expect(result.remaining).toBe(9);
    });

    it('should fail open when Redis INCR has error in result', async () => {
      mockExec.mockResolvedValue([[new Error('INCR failed'), null], [null, 1]]);

      const result = await rateLimitService.checkAndIncrement('user-123', 'free', false);

      expect(result.allowed).toBe(true);
    });

    it('should include resetAt timestamp in the future', async () => {
      mockExec.mockResolvedValue([[null, 1], [null, 1]]);

      const result = await rateLimitService.checkAndIncrement('user-123', 'free', false);

      expect(result.resetAt).toBeGreaterThan(Date.now());
    });
  });

  describe('getRemaining', () => {
    it('should return remaining count from Redis', async () => {
      mockGet.mockResolvedValue('5');

      const result = await rateLimitService.getRemaining('user-123', 'free', false);

      expect(result.limit).toBe(10);
      expect(result.remaining).toBe(5);
      expect(result.allowed).toBe(true);
    });

    it('should return full limit when no key exists', async () => {
      mockGet.mockResolvedValue(null);

      const result = await rateLimitService.getRemaining('user-123', 'free', false);

      expect(result.limit).toBe(10);
      expect(result.remaining).toBe(10);
      expect(result.allowed).toBe(true);
    });

    it('should return not allowed when limit exceeded', async () => {
      mockGet.mockResolvedValue('11');

      const result = await rateLimitService.getRemaining('user-123', 'free', false);

      expect(result.remaining).toBe(0);
      expect(result.allowed).toBe(false);
    });

    it('should fail open when Redis throws', async () => {
      mockGet.mockRejectedValue(new Error('Redis down'));

      const result = await rateLimitService.getRemaining('user-123', 'free', false);

      expect(result.allowed).toBe(true);
      expect(result.limit).toBe(10);
      expect(result.remaining).toBe(10);
    });
  });
});
