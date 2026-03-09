import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';
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
    STRIPE_SECRET_KEY: 'sk_test_xxx',
    STRIPE_WEBHOOK_SECRET: 'whsec_xxx',
    STRIPE_PRO_PRICE_ID: 'price_pro',
    STRIPE_BUSINESS_PRICE_ID: 'price_biz',
    OPENROUTER_API_KEY: 'test-openrouter-key',
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

vi.mock('../services/share-link.service', () => ({
  shareLinkService: {
    getSliderData: vi.fn(),
    createShareLink: vi.fn(),
    getByToken: vi.fn(),
    listByProject: vi.fn(),
    deleteShareLink: vi.fn(),
  },
}));

import { shareLinkRoutes, publicShareRoutes } from '../routes/share-link.routes';
import { errorHandler } from '../middleware/error-handler';
import { shareLinkService } from '../services/share-link.service';
import { supabaseAdmin } from '../lib/supabase';
import { AppError } from '../lib/errors';

const mockService = vi.mocked(shareLinkService);
const mockGetUser = vi.mocked(supabaseAdmin.auth.getUser);

const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000';
const SHARE_UUID = '660e8400-e29b-41d4-a716-446655440000';
const SHARE_TOKEN = 'abcdef1234567890abcdef1234567890';
const MOCK_USER = {
  id: 'user-1',
  email: 'test@example.com',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  created_at: '2024-01-01',
};

let app: FastifyInstance;

async function buildApp() {
  const server = Fastify();
  server.setErrorHandler(errorHandler);
  server.register(shareLinkRoutes, { prefix: '/api/projects' });
  server.register(publicShareRoutes, { prefix: '/api/share' });
  await server.ready();
  return server;
}

function authHeaders() {
  return { authorization: 'Bearer valid-token' };
}

describe('share-link routes', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    mockGetUser.mockResolvedValue({
      data: { user: MOCK_USER as never },
      error: null,
    });
    app = await buildApp();
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  describe('GET /api/projects/:projectId/slider-data', () => {
    it('should return slider data for project', async () => {
      const sliderData = {
        original_url: 'original.jpg',
        rendered_url: 'rendered.jpg',
        version_id: VALID_UUID,
        project_name: 'Sala Moderna',
        style: 'moderno',
        created_at: '2026-03-01T00:00:00Z',
      };

      mockService.getSliderData.mockResolvedValue(sliderData);

      const response = await app.inject({
        method: 'GET',
        url: `/api/projects/${VALID_UUID}/slider-data`,
        headers: authHeaders(),
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data.original_url).toBe('original.jpg');
      expect(body.data.rendered_url).toBe('rendered.jpg');
      expect(body.data.project_name).toBe('Sala Moderna');
    });

    it('should pass version_id query param to service', async () => {
      const versionUuid = '770e8400-e29b-41d4-a716-446655440000';
      mockService.getSliderData.mockResolvedValue({
        original_url: 'orig.jpg',
        rendered_url: 'render.jpg',
        version_id: versionUuid,
        project_name: 'Test',
        style: 'industrial',
        created_at: '2026-03-01T00:00:00Z',
      });

      await app.inject({
        method: 'GET',
        url: `/api/projects/${VALID_UUID}/slider-data?version_id=${versionUuid}`,
        headers: authHeaders(),
      });

      expect(mockService.getSliderData).toHaveBeenCalledWith(
        VALID_UUID,
        'user-1',
        'valid-token',
        versionUuid,
      );
    });

    it('should return 404 when no rendered version', async () => {
      mockService.getSliderData.mockRejectedValue(
        new AppError({ code: 'NO_RENDERED_VERSION', message: 'No rendered version', statusCode: 404 }),
      );

      const response = await app.inject({
        method: 'GET',
        url: `/api/projects/${VALID_UUID}/slider-data`,
        headers: authHeaders(),
      });

      expect(response.statusCode).toBe(404);
    });

    it('should return 403 when project not owned', async () => {
      mockService.getSliderData.mockRejectedValue(
        new AppError({ code: 'PROJECT_FORBIDDEN', message: 'Forbidden', statusCode: 403 }),
      );

      const response = await app.inject({
        method: 'GET',
        url: `/api/projects/${VALID_UUID}/slider-data`,
        headers: authHeaders(),
      });

      expect(response.statusCode).toBe(403);
    });

    it('should return 401 without auth token', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/projects/${VALID_UUID}/slider-data`,
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('POST /api/projects/:projectId/share', () => {
    it('should create share link and return 201', async () => {
      const shareData = {
        share_id: SHARE_UUID,
        share_url: `/share/${SHARE_TOKEN}`,
        share_token: SHARE_TOKEN,
        expires_at: null,
      };

      mockService.createShareLink.mockResolvedValue(shareData);

      const response = await app.inject({
        method: 'POST',
        url: `/api/projects/${VALID_UUID}/share`,
        headers: { ...authHeaders(), 'content-type': 'application/json' },
        payload: {},
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body.data.share_token).toBe(SHARE_TOKEN);
      expect(body.data.share_url).toContain('/share/');
    });

    it('should pass options to service', async () => {
      const versionUuid = '770e8400-e29b-41d4-a716-446655440000';
      mockService.createShareLink.mockResolvedValue({
        share_id: SHARE_UUID,
        share_url: `/share/${SHARE_TOKEN}`,
        share_token: SHARE_TOKEN,
        expires_at: '2026-04-01T00:00:00Z',
      });

      await app.inject({
        method: 'POST',
        url: `/api/projects/${VALID_UUID}/share`,
        headers: { ...authHeaders(), 'content-type': 'application/json' },
        payload: { version_id: versionUuid, expires_in_days: 30 },
      });

      expect(mockService.createShareLink).toHaveBeenCalledWith(
        VALID_UUID,
        'user-1',
        'valid-token',
        { version_id: versionUuid, expires_in_days: 30 },
      );
    });

    it('should return 400 when no rendered version', async () => {
      mockService.createShareLink.mockRejectedValue(
        new AppError({ code: 'NO_RENDERED_VERSION', message: 'Cannot share', statusCode: 400 }),
      );

      const response = await app.inject({
        method: 'POST',
        url: `/api/projects/${VALID_UUID}/share`,
        headers: { ...authHeaders(), 'content-type': 'application/json' },
        payload: {},
      });

      expect(response.statusCode).toBe(400);
    });

    it('should return 401 without auth token', async () => {
      const response = await app.inject({
        method: 'POST',
        url: `/api/projects/${VALID_UUID}/share`,
        headers: { 'content-type': 'application/json' },
        payload: {},
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('GET /api/share/:shareToken (public)', () => {
    it('should return share data without auth', async () => {
      const shareData = {
        original_url: 'original.jpg',
        rendered_url: 'rendered.jpg',
        project_name: 'Sala Moderna',
        style: 'moderno',
        created_at: '2026-03-01T00:00:00Z',
        include_watermark: false,
        og: {
          title: 'Sala Moderna | DecorAI',
          description: 'Veja a transformacao do ambiente',
          image: 'rendered.jpg',
          url: `/share/${SHARE_TOKEN}`,
        },
      };

      mockService.getByToken.mockResolvedValue(shareData);

      const response = await app.inject({
        method: 'GET',
        url: `/api/share/${SHARE_TOKEN}`,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data.project_name).toBe('Sala Moderna');
      expect(body.data.og.title).toBe('Sala Moderna | DecorAI');
      expect(body.data.include_watermark).toBe(false);
    });

    it('should return 410 for expired share token', async () => {
      mockService.getByToken.mockRejectedValue(
        new AppError({ code: 'SHARE_EXPIRED', message: 'Expired', statusCode: 410 }),
      );

      const response = await app.inject({
        method: 'GET',
        url: `/api/share/${SHARE_TOKEN}`,
      });

      expect(response.statusCode).toBe(410);
    });

    it('should return 404 for invalid share token', async () => {
      mockService.getByToken.mockRejectedValue(
        new AppError({ code: 'SHARE_NOT_FOUND', message: 'Not found', statusCode: 404 }),
      );

      const response = await app.inject({
        method: 'GET',
        url: '/api/share/invalid-token',
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('GET /api/projects/:projectId/shares', () => {
    it('should list all share links', async () => {
      const shares = [
        {
          share_id: 'share-1',
          share_token: 'token1',
          share_url: '/share/token1',
          version_id: VALID_UUID,
          view_count: 10,
          expires_at: null,
          created_at: '2026-03-01T00:00:00Z',
          is_active: true,
        },
      ];

      mockService.listByProject.mockResolvedValue(shares);

      const response = await app.inject({
        method: 'GET',
        url: `/api/projects/${VALID_UUID}/shares`,
        headers: authHeaders(),
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data).toHaveLength(1);
      expect(body.data[0].view_count).toBe(10);
    });

    it('should return 403 when project not owned', async () => {
      mockService.listByProject.mockRejectedValue(
        new AppError({ code: 'PROJECT_FORBIDDEN', message: 'Forbidden', statusCode: 403 }),
      );

      const response = await app.inject({
        method: 'GET',
        url: `/api/projects/${VALID_UUID}/shares`,
        headers: authHeaders(),
      });

      expect(response.statusCode).toBe(403);
    });

    it('should return 401 without auth token', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/projects/${VALID_UUID}/shares`,
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('DELETE /api/projects/:projectId/shares/:shareId', () => {
    it('should delete share link and return 204', async () => {
      mockService.deleteShareLink.mockResolvedValue(undefined);

      const response = await app.inject({
        method: 'DELETE',
        url: `/api/projects/${VALID_UUID}/shares/${SHARE_UUID}`,
        headers: authHeaders(),
      });

      expect(response.statusCode).toBe(204);
    });

    it('should return 404 when share link not found', async () => {
      mockService.deleteShareLink.mockRejectedValue(
        new AppError({ code: 'SHARE_NOT_FOUND', message: 'Not found', statusCode: 404 }),
      );

      const response = await app.inject({
        method: 'DELETE',
        url: `/api/projects/${VALID_UUID}/shares/${SHARE_UUID}`,
        headers: authHeaders(),
      });

      expect(response.statusCode).toBe(404);
    });

    it('should return 403 when project not owned', async () => {
      mockService.deleteShareLink.mockRejectedValue(
        new AppError({ code: 'PROJECT_FORBIDDEN', message: 'Forbidden', statusCode: 403 }),
      );

      const response = await app.inject({
        method: 'DELETE',
        url: `/api/projects/${VALID_UUID}/shares/${SHARE_UUID}`,
        headers: authHeaders(),
      });

      expect(response.statusCode).toBe(403);
    });

    it('should return 401 without auth token', async () => {
      const response = await app.inject({
        method: 'DELETE',
        url: `/api/projects/${VALID_UUID}/shares/${SHARE_UUID}`,
      });

      expect(response.statusCode).toBe(401);
    });

    it('should return 400 for invalid UUIDs', async () => {
      const response = await app.inject({
        method: 'DELETE',
        url: '/api/projects/invalid/shares/also-invalid',
        headers: authHeaders(),
      });

      expect(response.statusCode).toBe(400);
    });
  });
});
