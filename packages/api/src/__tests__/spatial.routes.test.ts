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

vi.mock('../services/spatial.service', () => ({
  spatialService: {
    upsert: vi.fn(),
    get: vi.fn(),
  },
}));

import { spatialRoutes } from '../routes/spatial.routes';
import { errorHandler } from '../middleware/error-handler';
import { spatialService } from '../services/spatial.service';
import { supabaseAdmin } from '../lib/supabase';
import { AppError } from '../lib/errors';

const mockSpatialService = vi.mocked(spatialService);
const mockGetUser = vi.mocked(supabaseAdmin.auth.getUser);

const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000';
const MOCK_USER = {
  id: 'user-1',
  email: 'test@example.com',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  created_at: '2024-01-01',
};

const buildApp = async (): Promise<FastifyInstance> => {
  const app = Fastify({ logger: false });
  app.setErrorHandler(errorHandler);
  await app.register(spatialRoutes, { prefix: '/projects' });
  await app.ready();
  return app;
};

describe('spatial routes', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    vi.clearAllMocks();
    app = await buildApp();
    mockGetUser.mockResolvedValue({
      data: { user: MOCK_USER },
      error: null,
    } as never);
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  describe('PUT /projects/:id/spatial-input', () => {
    it('should return 200 with spatial input on successful upsert', async () => {
      const mockResult = {
        id: 'spatial-1',
        project_id: VALID_UUID,
        dimensions: { width: 4, length: 6, height: 2.8 },
        openings: [],
        items: [],
      };

      mockSpatialService.upsert.mockResolvedValue(mockResult as never);

      const res = await app.inject({
        method: 'PUT',
        url: `/projects/${VALID_UUID}/spatial-input`,
        headers: { authorization: 'Bearer valid-token' },
        payload: {
          dimensions: { width: 4, length: 6, height: 2.8 },
        },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body.data.dimensions.width).toBe(4);
    });

    it('should return 200 with full spatial input including openings and items', async () => {
      const payload = {
        dimensions: { width: 4, length: 6, height: 2.8 },
        openings: [{ type: 'window', wall: 'north', width: 2, height: 1.5 }],
        items: [{ name: 'sofa', width: 2.2, position: 'center-south' }],
      };

      mockSpatialService.upsert.mockResolvedValue({ id: 'spatial-1', ...payload } as never);

      const res = await app.inject({
        method: 'PUT',
        url: `/projects/${VALID_UUID}/spatial-input`,
        headers: { authorization: 'Bearer valid-token' },
        payload,
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body.data.openings).toHaveLength(1);
      expect(body.data.items).toHaveLength(1);
    });

    it('should return 400 on negative dimensions', async () => {
      const res = await app.inject({
        method: 'PUT',
        url: `/projects/${VALID_UUID}/spatial-input`,
        headers: { authorization: 'Bearer valid-token' },
        payload: {
          dimensions: { width: -1, length: 6, height: 2.8 },
        },
      });

      expect(res.statusCode).toBe(400);
      const body = JSON.parse(res.body);
      expect(body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 on zero dimensions', async () => {
      const res = await app.inject({
        method: 'PUT',
        url: `/projects/${VALID_UUID}/spatial-input`,
        headers: { authorization: 'Bearer valid-token' },
        payload: {
          dimensions: { width: 0, length: 6, height: 2.8 },
        },
      });

      expect(res.statusCode).toBe(400);
    });

    it('should return 400 on invalid opening type', async () => {
      const res = await app.inject({
        method: 'PUT',
        url: `/projects/${VALID_UUID}/spatial-input`,
        headers: { authorization: 'Bearer valid-token' },
        payload: {
          openings: [{ type: 'skylight', wall: 'north', width: 2, height: 1.5 }],
        },
      });

      expect(res.statusCode).toBe(400);
      const body = JSON.parse(res.body);
      expect(body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 on invalid UUID param', async () => {
      const res = await app.inject({
        method: 'PUT',
        url: '/projects/not-a-uuid/spatial-input',
        headers: { authorization: 'Bearer valid-token' },
        payload: { dimensions: { width: 4, length: 6, height: 2.8 } },
      });

      expect(res.statusCode).toBe(400);
    });

    it('should return 401 without auth header', async () => {
      const res = await app.inject({
        method: 'PUT',
        url: `/projects/${VALID_UUID}/spatial-input`,
        payload: { dimensions: { width: 4, length: 6, height: 2.8 } },
      });

      expect(res.statusCode).toBe(401);
    });

    it('should return 404 when project not found', async () => {
      mockSpatialService.upsert.mockRejectedValue(
        new AppError({ code: 'PROJECT_NOT_FOUND', message: 'Projeto nao encontrado', statusCode: 404 }),
      );

      const res = await app.inject({
        method: 'PUT',
        url: `/projects/${VALID_UUID}/spatial-input`,
        headers: { authorization: 'Bearer valid-token' },
        payload: { dimensions: { width: 4, length: 6, height: 2.8 } },
      });

      expect(res.statusCode).toBe(404);
    });
  });

  describe('GET /projects/:id/spatial-input', () => {
    it('should return 200 with spatial input data', async () => {
      const mockResult = {
        id: 'spatial-1',
        project_id: VALID_UUID,
        dimensions: { width: 4, length: 6, height: 2.8 },
        openings: [],
        items: [],
        croqui_ascii: null,
        croqui_approved: false,
      };

      mockSpatialService.get.mockResolvedValue(mockResult as never);

      const res = await app.inject({
        method: 'GET',
        url: `/projects/${VALID_UUID}/spatial-input`,
        headers: { authorization: 'Bearer valid-token' },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body.data.id).toBe('spatial-1');
      expect(body.data.croqui_approved).toBe(false);
    });

    it('should return 404 when no spatial input exists', async () => {
      mockSpatialService.get.mockRejectedValue(
        new AppError({ code: 'SPATIAL_INPUT_NOT_FOUND', message: 'Dados espaciais nao encontrados', statusCode: 404 }),
      );

      const res = await app.inject({
        method: 'GET',
        url: `/projects/${VALID_UUID}/spatial-input`,
        headers: { authorization: 'Bearer valid-token' },
      });

      expect(res.statusCode).toBe(404);
      const body = JSON.parse(res.body);
      expect(body.error.code).toBe('SPATIAL_INPUT_NOT_FOUND');
    });

    it('should return 404 when project belongs to another user', async () => {
      mockSpatialService.get.mockRejectedValue(
        new AppError({ code: 'PROJECT_NOT_FOUND', message: 'Projeto nao encontrado', statusCode: 404 }),
      );

      const res = await app.inject({
        method: 'GET',
        url: `/projects/${VALID_UUID}/spatial-input`,
        headers: { authorization: 'Bearer valid-token' },
      });

      expect(res.statusCode).toBe(404);
    });

    it('should return 401 without auth header', async () => {
      const res = await app.inject({
        method: 'GET',
        url: `/projects/${VALID_UUID}/spatial-input`,
      });

      expect(res.statusCode).toBe(401);
    });
  });
});
