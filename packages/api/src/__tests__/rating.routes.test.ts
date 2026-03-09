import { describe, it, expect, vi, beforeEach } from 'vitest';
import Fastify from 'fastify';
import type { FastifyInstance } from 'fastify';

vi.mock('../lib/supabase', () => ({
  supabaseAdmin: {
    auth: {
      getUser: vi.fn(),
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

vi.mock('../services/rating.service', () => ({
  ratingService: {
    upsertRating: vi.fn(),
    getRating: vi.fn(),
    submitNps: vi.fn(),
    dismissNps: vi.fn(),
    shouldShowNps: vi.fn(),
    getRatingAnalytics: vi.fn(),
    getNpsAnalytics: vi.fn(),
  },
}));

import { ratingRoutes, analyticsRoutes } from '../routes/rating.routes';
import { errorHandler } from '../middleware/error-handler';
import { ratingService } from '../services/rating.service';
import { supabaseAdmin } from '../lib/supabase';

const mockRatingService = vi.mocked(ratingService);
const mockGetUser = vi.mocked(supabaseAdmin.auth.getUser);

const MOCK_USER = {
  id: 'user-123',
  email: 'test@example.com',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  created_at: '2024-01-01',
};

const MOCK_ADMIN = {
  id: 'admin-123',
  email: 'admin@example.com',
  app_metadata: { role: 'admin' },
  user_metadata: {},
  aud: 'authenticated',
  created_at: '2024-01-01',
};

const UUID = '550e8400-e29b-41d4-a716-446655440000';

const buildApp = async (): Promise<FastifyInstance> => {
  const app = Fastify({ logger: false });
  app.setErrorHandler(errorHandler);
  await app.register(ratingRoutes, { prefix: '/api' });
  await app.register(analyticsRoutes, { prefix: '/api/admin/analytics' });
  await app.ready();
  return app;
};

describe('rating routes', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockGetUser.mockResolvedValue({
      data: { user: MOCK_USER },
      error: null,
    } as never);
    app = await buildApp();
  });

  describe('POST /api/renders/:renderId/rating', () => {
    it('should create a rating', async () => {
      const mockRating = { id: 'r1', render_id: UUID, user_id: 'user-123', score: 4 };
      mockRatingService.upsertRating.mockResolvedValue(mockRating);

      const response = await app.inject({
        method: 'POST',
        url: `/api/renders/${UUID}/rating`,
        headers: { authorization: 'Bearer valid-token' },
        payload: { score: 4, tags: ['realistic'] },
      });

      expect(response.statusCode).toBe(201);
      expect(JSON.parse(response.body).data).toEqual(mockRating);
    });

    it('should return 401 without auth', async () => {
      const response = await app.inject({
        method: 'POST',
        url: `/api/renders/${UUID}/rating`,
        payload: { score: 4, tags: [] },
      });

      expect(response.statusCode).toBe(401);
    });

    it('should return 400 for invalid score', async () => {
      const response = await app.inject({
        method: 'POST',
        url: `/api/renders/${UUID}/rating`,
        headers: { authorization: 'Bearer valid-token' },
        payload: { score: 6, tags: [] },
      });

      expect(response.statusCode).toBe(400);
    });

    it('should return 400 for invalid renderId', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/renders/not-a-uuid/rating',
        headers: { authorization: 'Bearer valid-token' },
        payload: { score: 3, tags: [] },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('GET /api/renders/:renderId/rating', () => {
    it('should get a rating', async () => {
      const mockRating = { id: 'r1', score: 4, tags: ['lighting'] };
      mockRatingService.getRating.mockResolvedValue(mockRating);

      const response = await app.inject({
        method: 'GET',
        url: `/api/renders/${UUID}/rating`,
        headers: { authorization: 'Bearer valid-token' },
      });

      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body).data).toEqual(mockRating);
    });

    it('should return 404 when not found', async () => {
      mockRatingService.getRating.mockResolvedValue(null);

      const response = await app.inject({
        method: 'GET',
        url: `/api/renders/${UUID}/rating`,
        headers: { authorization: 'Bearer valid-token' },
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('POST /api/nps/submit', () => {
    it('should submit NPS score', async () => {
      const mockNps = { id: 'nps-1', user_id: 'user-123', score: 9, comment: null };
      mockRatingService.submitNps.mockResolvedValue(mockNps);

      const response = await app.inject({
        method: 'POST',
        url: '/api/nps/submit',
        headers: { authorization: 'Bearer valid-token' },
        payload: { score: 9 },
      });

      expect(response.statusCode).toBe(201);
      expect(JSON.parse(response.body).data).toEqual(mockNps);
    });

    it('should reject invalid NPS score', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/nps/submit',
        headers: { authorization: 'Bearer valid-token' },
        payload: { score: 11 },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('POST /api/nps/dismiss', () => {
    it('should dismiss NPS survey', async () => {
      mockRatingService.dismissNps.mockResolvedValue(undefined);

      const response = await app.inject({
        method: 'POST',
        url: '/api/nps/dismiss',
        headers: { authorization: 'Bearer valid-token' },
      });

      expect(response.statusCode).toBe(204);
    });
  });

  describe('GET /api/nps/should-show', () => {
    it('should return should_show status', async () => {
      mockRatingService.shouldShowNps.mockResolvedValue(true);

      const response = await app.inject({
        method: 'GET',
        url: '/api/nps/should-show',
        headers: { authorization: 'Bearer valid-token' },
      });

      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body).data.should_show).toBe(true);
    });
  });

  describe('GET /api/admin/analytics/ratings', () => {
    it('should return 403 for non-admin users', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/admin/analytics/ratings',
        headers: { authorization: 'Bearer valid-token' },
      });

      expect(response.statusCode).toBe(403);
    });

    it('should return analytics for admin users', async () => {
      mockGetUser.mockResolvedValue({ data: { user: MOCK_ADMIN }, error: null } as never);
      const mockAnalytics = { average_score: 4.2, total_ratings: 100 };
      mockRatingService.getRatingAnalytics.mockResolvedValue(mockAnalytics);

      const response = await app.inject({
        method: 'GET',
        url: '/api/admin/analytics/ratings',
        headers: { authorization: 'Bearer valid-token' },
      });

      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body).data).toEqual(mockAnalytics);
    });
  });

  describe('GET /api/admin/analytics/nps', () => {
    it('should return 403 for non-admin users', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/admin/analytics/nps',
        headers: { authorization: 'Bearer valid-token' },
      });

      expect(response.statusCode).toBe(403);
    });

    it('should return NPS analytics for admin users', async () => {
      mockGetUser.mockResolvedValue({ data: { user: MOCK_ADMIN }, error: null } as never);
      const mockNps = { nps_score: 45, total_responses: 50 };
      mockRatingService.getNpsAnalytics.mockResolvedValue(mockNps);

      const response = await app.inject({
        method: 'GET',
        url: '/api/admin/analytics/nps',
        headers: { authorization: 'Bearer valid-token' },
      });

      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body).data).toEqual(mockNps);
    });
  });
});
