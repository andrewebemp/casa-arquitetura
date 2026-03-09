import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Fastify, { FastifyInstance } from 'fastify';

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
    auth: {
      getUser: vi.fn(),
    },
  },
  createUserClient: vi.fn(),
}));

vi.mock('../services/semantic-cache.service', () => ({
  semanticCacheService: {
    getStats: vi.fn(),
    invalidate: vi.fn(),
  },
}));

import { supabaseAdmin } from '../lib/supabase';
import { semanticCacheService } from '../services/semantic-cache.service';
import { cacheRoutes } from '../routes/cache.routes';

const mockGetUser = supabaseAdmin.auth.getUser as ReturnType<typeof vi.fn>;
const mockGetStats = semanticCacheService.getStats as ReturnType<typeof vi.fn>;
const mockInvalidate = semanticCacheService.invalidate as ReturnType<typeof vi.fn>;

describe('cache.routes', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    vi.clearAllMocks();
    app = Fastify({ logger: false });
    app.register(cacheRoutes, { prefix: '/api' });
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
  });

  const adminUser = {
    id: 'admin-user-id',
    app_metadata: { role: 'admin' },
    user_metadata: {},
    aud: 'authenticated',
    created_at: '',
  };

  const regularUser = {
    id: 'regular-user-id',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: '',
  };

  describe('GET /api/cache/stats', () => {
    it('should return cache stats for admin user', async () => {
      mockGetUser.mockResolvedValue({ data: { user: adminUser }, error: null });
      mockGetStats.mockResolvedValue({
        hitRate: 0.75,
        totalEntries: 42,
        memoryUsageBytes: 2097152,
        topCached: [{ hash: 'abc123', accessCount: 100, createdAt: Date.now() }],
      });

      const response = await app.inject({
        method: 'GET',
        url: '/api/cache/stats',
        headers: { authorization: 'Bearer valid-admin-token' },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data.hitRate).toBe(0.75);
      expect(body.data.totalEntries).toBe(42);
      expect(body.data.topCached).toHaveLength(1);
    });

    it('should return 401 without auth token', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/cache/stats',
      });

      expect(response.statusCode).toBe(401);
    });

    it('should return 403 for non-admin user', async () => {
      mockGetUser.mockResolvedValue({ data: { user: regularUser }, error: null });

      const response = await app.inject({
        method: 'GET',
        url: '/api/cache/stats',
        headers: { authorization: 'Bearer valid-user-token' },
      });

      expect(response.statusCode).toBe(403);
    });
  });

  describe('DELETE /api/cache/render/:hash', () => {
    const validHash = 'a'.repeat(64);

    it('should invalidate cache entry for admin', async () => {
      mockGetUser.mockResolvedValue({ data: { user: adminUser }, error: null });
      mockInvalidate.mockResolvedValue(true);

      const response = await app.inject({
        method: 'DELETE',
        url: `/api/cache/render/${validHash}`,
        headers: { authorization: 'Bearer valid-admin-token' },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data.invalidated).toBe(true);
      expect(mockInvalidate).toHaveBeenCalledWith(validHash);
    });

    it('should return 404 when cache entry not found', async () => {
      mockGetUser.mockResolvedValue({ data: { user: adminUser }, error: null });
      mockInvalidate.mockResolvedValue(false);

      const response = await app.inject({
        method: 'DELETE',
        url: `/api/cache/render/${validHash}`,
        headers: { authorization: 'Bearer valid-admin-token' },
      });

      expect(response.statusCode).toBe(404);
    });

    it('should return 401 without auth token', async () => {
      const response = await app.inject({
        method: 'DELETE',
        url: `/api/cache/render/${validHash}`,
      });

      expect(response.statusCode).toBe(401);
    });

    it('should return 403 for non-admin user', async () => {
      mockGetUser.mockResolvedValue({ data: { user: regularUser }, error: null });

      const response = await app.inject({
        method: 'DELETE',
        url: `/api/cache/render/${validHash}`,
        headers: { authorization: 'Bearer valid-user-token' },
      });

      expect(response.statusCode).toBe(403);
    });

    it('should return 400 for invalid hash format', async () => {
      mockGetUser.mockResolvedValue({ data: { user: adminUser }, error: null });

      const response = await app.inject({
        method: 'DELETE',
        url: '/api/cache/render/invalid-hash',
        headers: { authorization: 'Bearer valid-admin-token' },
      });

      expect(response.statusCode).toBe(400);
    });
  });
});
