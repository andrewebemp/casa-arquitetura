import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FastifyReply, FastifyRequest } from 'fastify';

vi.mock('../lib/supabase', () => ({
  supabaseAdmin: {
    auth: {
      getUser: vi.fn(),
    },
  },
}));

vi.mock('../services/subscription.service', () => ({
  subscriptionService: {
    getByUserId: vi.fn(),
  },
}));

vi.mock('../services/rate-limit.service', () => ({
  rateLimitService: {
    checkAndIncrement: vi.fn(),
  },
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

vi.mock('../lib/redis', () => ({
  getRedisClient: vi.fn(() => ({
    multi: vi.fn(() => ({
      incr: vi.fn(),
      expire: vi.fn(),
      exec: vi.fn().mockResolvedValue([[null, 1], [null, 1]]),
    })),
    get: vi.fn(),
  })),
}));

import { rateLimitMiddleware } from '../middleware/rate-limit.middleware';
import { supabaseAdmin } from '../lib/supabase';
import { subscriptionService } from '../services/subscription.service';
import { rateLimitService } from '../services/rate-limit.service';

const mockGetUser = vi.mocked(supabaseAdmin.auth.getUser);
const mockGetByUserId = vi.mocked(subscriptionService.getByUserId);
const mockCheckAndIncrement = vi.mocked(rateLimitService.checkAndIncrement);

const createMockRequest = (overrides: Partial<FastifyRequest> = {}): FastifyRequest => {
  return {
    url: '/projects',
    ip: '192.168.1.1',
    headers: {},
    method: 'GET',
    ...overrides,
  } as unknown as FastifyRequest;
};

const createMockReply = (): FastifyReply => {
  const reply = {
    header: vi.fn().mockReturnThis(),
    status: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
  } as unknown as FastifyReply;
  return reply;
};

const nowMs = Date.now();
const resetAt = (Math.floor(nowMs / 60000) + 1) * 60000;

describe('rateLimitMiddleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('webhook exemption', () => {
    it('should skip rate limiting for /webhooks/ routes', async () => {
      const request = createMockRequest({ url: '/webhooks/stripe' });
      const reply = createMockReply();

      await rateLimitMiddleware(request, reply);

      expect(mockCheckAndIncrement).not.toHaveBeenCalled();
      expect(reply.header).not.toHaveBeenCalled();
    });

    it('should skip rate limiting for /webhooks/asaas routes', async () => {
      const request = createMockRequest({ url: '/webhooks/asaas' });
      const reply = createMockReply();

      await rateLimitMiddleware(request, reply);

      expect(mockCheckAndIncrement).not.toHaveBeenCalled();
    });
  });

  describe('anonymous (IP-based) rate limiting', () => {
    it('should use IP-based limiting for unauthenticated requests', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'No token', name: 'AuthError', status: 401 },
      } as ReturnType<typeof supabaseAdmin.auth.getUser> extends Promise<infer R> ? R : never);

      mockCheckAndIncrement.mockResolvedValue({
        allowed: true,
        limit: 30,
        remaining: 29,
        resetAt,
      });

      const request = createMockRequest({ ip: '10.0.0.1' });
      const reply = createMockReply();

      await rateLimitMiddleware(request, reply);

      expect(mockCheckAndIncrement).toHaveBeenCalledWith('10.0.0.1', 'anonymous', true);
      expect(reply.header).toHaveBeenCalledWith('X-RateLimit-Limit', 30);
      expect(reply.header).toHaveBeenCalledWith('X-RateLimit-Remaining', 29);
    });

    it('should use x-forwarded-for IP when available', async () => {
      mockCheckAndIncrement.mockResolvedValue({
        allowed: true,
        limit: 30,
        remaining: 28,
        resetAt,
      });

      const request = createMockRequest({
        ip: '10.0.0.1',
        headers: { 'x-forwarded-for': '203.0.113.50, 70.41.3.18' },
      });
      const reply = createMockReply();

      await rateLimitMiddleware(request, reply);

      expect(mockCheckAndIncrement).toHaveBeenCalledWith('203.0.113.50', 'anonymous', true);
    });

    it('should return 429 when anonymous limit exceeded', async () => {
      mockCheckAndIncrement.mockResolvedValue({
        allowed: false,
        limit: 30,
        remaining: 0,
        resetAt,
      });

      const request = createMockRequest();
      const reply = createMockReply();

      await rateLimitMiddleware(request, reply);

      expect(reply.status).toHaveBeenCalledWith(429);
      expect(reply.send).toHaveBeenCalledWith(expect.objectContaining({
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: expect.any(String),
        },
        limit: 30,
        remaining: 0,
        resetAt: expect.any(String),
      }));
      expect(reply.header).toHaveBeenCalledWith('Retry-After', expect.any(Number));
    });
  });

  describe('authenticated rate limiting', () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated',
      created_at: '2024-01-01',
    };

    it('should use free tier limits for authenticated free user', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      } as ReturnType<typeof supabaseAdmin.auth.getUser> extends Promise<infer R> ? R : never);

      mockGetByUserId.mockResolvedValue({
        tier: 'free',
        status: 'active',
      } as ReturnType<typeof subscriptionService.getByUserId> extends Promise<infer R> ? R : never);

      mockCheckAndIncrement.mockResolvedValue({
        allowed: true,
        limit: 10,
        remaining: 9,
        resetAt,
      });

      const request = createMockRequest({
        headers: { authorization: 'Bearer valid-token' },
      });
      const reply = createMockReply();

      await rateLimitMiddleware(request, reply);

      expect(mockCheckAndIncrement).toHaveBeenCalledWith('user-123', 'free', false);
      expect(reply.header).toHaveBeenCalledWith('X-RateLimit-Limit', 10);
    });

    it('should use pro tier limits for pro user', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      } as ReturnType<typeof supabaseAdmin.auth.getUser> extends Promise<infer R> ? R : never);

      mockGetByUserId.mockResolvedValue({
        tier: 'pro',
        status: 'active',
      } as ReturnType<typeof subscriptionService.getByUserId> extends Promise<infer R> ? R : never);

      mockCheckAndIncrement.mockResolvedValue({
        allowed: true,
        limit: 60,
        remaining: 59,
        resetAt,
      });

      const request = createMockRequest({
        headers: { authorization: 'Bearer valid-token' },
      });
      const reply = createMockReply();

      await rateLimitMiddleware(request, reply);

      expect(mockCheckAndIncrement).toHaveBeenCalledWith('user-123', 'pro', false);
      expect(reply.header).toHaveBeenCalledWith('X-RateLimit-Limit', 60);
    });

    it('should use business tier limits for business user', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      } as ReturnType<typeof supabaseAdmin.auth.getUser> extends Promise<infer R> ? R : never);

      mockGetByUserId.mockResolvedValue({
        tier: 'business',
        status: 'active',
      } as ReturnType<typeof subscriptionService.getByUserId> extends Promise<infer R> ? R : never);

      mockCheckAndIncrement.mockResolvedValue({
        allowed: true,
        limit: 120,
        remaining: 119,
        resetAt,
      });

      const request = createMockRequest({
        headers: { authorization: 'Bearer valid-token' },
      });
      const reply = createMockReply();

      await rateLimitMiddleware(request, reply);

      expect(mockCheckAndIncrement).toHaveBeenCalledWith('user-123', 'business', false);
      expect(reply.header).toHaveBeenCalledWith('X-RateLimit-Limit', 120);
    });

    it('should return 429 for free user who exceeded limit', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      } as ReturnType<typeof supabaseAdmin.auth.getUser> extends Promise<infer R> ? R : never);

      mockGetByUserId.mockResolvedValue({
        tier: 'free',
        status: 'active',
      } as ReturnType<typeof subscriptionService.getByUserId> extends Promise<infer R> ? R : never);

      mockCheckAndIncrement.mockResolvedValue({
        allowed: false,
        limit: 10,
        remaining: 0,
        resetAt,
      });

      const request = createMockRequest({
        headers: { authorization: 'Bearer valid-token' },
      });
      const reply = createMockReply();

      await rateLimitMiddleware(request, reply);

      expect(reply.status).toHaveBeenCalledWith(429);
      expect(reply.send).toHaveBeenCalledWith(expect.objectContaining({
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: expect.any(String),
        },
        limit: 10,
        remaining: 0,
      }));
    });

    it('should default to free tier when subscription lookup fails', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      } as ReturnType<typeof supabaseAdmin.auth.getUser> extends Promise<infer R> ? R : never);

      mockGetByUserId.mockRejectedValue(new Error('DB down'));

      mockCheckAndIncrement.mockResolvedValue({
        allowed: true,
        limit: 10,
        remaining: 9,
        resetAt,
      });

      const request = createMockRequest({
        headers: { authorization: 'Bearer valid-token' },
      });
      const reply = createMockReply();

      await rateLimitMiddleware(request, reply);

      expect(mockCheckAndIncrement).toHaveBeenCalledWith('user-123', 'free', false);
    });

    it('should default to free tier when no subscription found', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      } as ReturnType<typeof supabaseAdmin.auth.getUser> extends Promise<infer R> ? R : never);

      mockGetByUserId.mockResolvedValue(null);

      mockCheckAndIncrement.mockResolvedValue({
        allowed: true,
        limit: 10,
        remaining: 9,
        resetAt,
      });

      const request = createMockRequest({
        headers: { authorization: 'Bearer valid-token' },
      });
      const reply = createMockReply();

      await rateLimitMiddleware(request, reply);

      expect(mockCheckAndIncrement).toHaveBeenCalledWith('user-123', 'free', false);
    });
  });

  describe('response headers', () => {
    it('should set rate limit headers on every successful response', async () => {
      mockCheckAndIncrement.mockResolvedValue({
        allowed: true,
        limit: 30,
        remaining: 20,
        resetAt,
      });

      const request = createMockRequest();
      const reply = createMockReply();

      await rateLimitMiddleware(request, reply);

      expect(reply.header).toHaveBeenCalledWith('X-RateLimit-Limit', 30);
      expect(reply.header).toHaveBeenCalledWith('X-RateLimit-Remaining', 20);
      expect(reply.header).toHaveBeenCalledWith('X-RateLimit-Reset', expect.any(Number));
    });

    it('should set Retry-After header on 429 response', async () => {
      mockCheckAndIncrement.mockResolvedValue({
        allowed: false,
        limit: 30,
        remaining: 0,
        resetAt,
      });

      const request = createMockRequest();
      const reply = createMockReply();

      await rateLimitMiddleware(request, reply);

      expect(reply.header).toHaveBeenCalledWith('Retry-After', expect.any(Number));
    });
  });
});
