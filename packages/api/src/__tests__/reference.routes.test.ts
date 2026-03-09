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

vi.mock('../services/reference.service', () => ({
  referenceService: {
    verifyProjectOwnership: vi.fn(),
    validateFile: vi.fn(),
    create: vi.fn(),
    list: vi.fn(),
    getById: vi.fn(),
    delete: vi.fn(),
  },
}));

import { referenceService } from '../services/reference.service';
import { supabaseAdmin } from '../lib/supabase';
import { AppError } from '../lib/errors';
import { errorHandler } from '../middleware/error-handler';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  projectIdParamsSchema,
  referenceItemParamsSchema,
} from '../schemas/spatial.schema';

const mockRefService = vi.mocked(referenceService);
const mockGetUser = vi.mocked(supabaseAdmin.auth.getUser);

const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000';
const VALID_REF_UUID = '660e8400-e29b-41d4-a716-446655440000';
const MOCK_USER = {
  id: 'user-1',
  email: 'test@example.com',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  created_at: '2024-01-01',
};

interface ProjectIdParams { id: string }
interface ReferenceItemParams { id: string; refId: string }

const buildApp = async (): Promise<FastifyInstance> => {
  const app = Fastify({ logger: false });
  app.setErrorHandler(errorHandler);

  // Register GET, GET/:refId, DELETE routes directly (no multipart needed)
  app.get<{ Params: ProjectIdParams }>('/projects/:id/references', {
    preHandler: [authMiddleware, validate({ params: projectIdParamsSchema })],
  }, async (request, reply) => {
    const userId = request.user!.id;
    const items = await mockRefService.list(request.params.id, userId, 'token');
    return reply.status(200).send({ data: items });
  });

  app.get<{ Params: ReferenceItemParams }>('/projects/:id/references/:refId', {
    preHandler: [authMiddleware, validate({ params: referenceItemParamsSchema })],
  }, async (request, reply) => {
    const userId = request.user!.id;
    const item = await mockRefService.getById(request.params.id, request.params.refId, userId, 'token');
    return reply.status(200).send({ data: item });
  });

  app.delete<{ Params: ReferenceItemParams }>('/projects/:id/references/:refId', {
    preHandler: [authMiddleware, validate({ params: referenceItemParamsSchema })],
  }, async (request, reply) => {
    const userId = request.user!.id;
    await mockRefService.delete(request.params.id, request.params.refId, userId, 'token');
    return reply.status(204).send();
  });

  await app.ready();
  return app;
};

describe('reference routes', () => {
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

  describe('GET /projects/:id/references', () => {
    it('should return 200 with list of reference items', async () => {
      const items = [
        { id: 'ref-1', name: 'Sofa', created_at: '2026-01-01' },
        { id: 'ref-2', name: 'Mesa', created_at: '2026-01-02' },
      ];

      mockRefService.list.mockResolvedValue(items as never);

      const res = await app.inject({
        method: 'GET',
        url: `/projects/${VALID_UUID}/references`,
        headers: { authorization: 'Bearer valid-token' },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body.data).toHaveLength(2);
    });

    it('should return 401 without auth header', async () => {
      const res = await app.inject({
        method: 'GET',
        url: `/projects/${VALID_UUID}/references`,
      });

      expect(res.statusCode).toBe(401);
    });

    it('should return 404 when project not found', async () => {
      mockRefService.list.mockRejectedValue(
        new AppError({ code: 'PROJECT_NOT_FOUND', message: 'Projeto nao encontrado', statusCode: 404 }),
      );

      const res = await app.inject({
        method: 'GET',
        url: `/projects/${VALID_UUID}/references`,
        headers: { authorization: 'Bearer valid-token' },
      });

      expect(res.statusCode).toBe(404);
    });
  });

  describe('GET /projects/:id/references/:refId', () => {
    it('should return 200 with reference item details', async () => {
      const item = {
        id: VALID_REF_UUID,
        name: 'Sofa L-shape',
        image_url: 'https://signed-url.com',
        width_m: 2.2,
      };

      mockRefService.getById.mockResolvedValue(item as never);

      const res = await app.inject({
        method: 'GET',
        url: `/projects/${VALID_UUID}/references/${VALID_REF_UUID}`,
        headers: { authorization: 'Bearer valid-token' },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body.data.name).toBe('Sofa L-shape');
    });

    it('should return 404 when item does not exist', async () => {
      mockRefService.getById.mockRejectedValue(
        new AppError({ code: 'REFERENCE_NOT_FOUND', message: 'Item nao encontrado', statusCode: 404 }),
      );

      const res = await app.inject({
        method: 'GET',
        url: `/projects/${VALID_UUID}/references/${VALID_REF_UUID}`,
        headers: { authorization: 'Bearer valid-token' },
      });

      expect(res.statusCode).toBe(404);
      const body = JSON.parse(res.body);
      expect(body.error.code).toBe('REFERENCE_NOT_FOUND');
    });

    it('should return 400 on invalid refId UUID', async () => {
      const res = await app.inject({
        method: 'GET',
        url: `/projects/${VALID_UUID}/references/not-a-uuid`,
        headers: { authorization: 'Bearer valid-token' },
      });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('DELETE /projects/:id/references/:refId', () => {
    it('should return 204 on successful delete', async () => {
      mockRefService.delete.mockResolvedValue(undefined as never);

      const res = await app.inject({
        method: 'DELETE',
        url: `/projects/${VALID_UUID}/references/${VALID_REF_UUID}`,
        headers: { authorization: 'Bearer valid-token' },
      });

      expect(res.statusCode).toBe(204);
    });

    it('should return 404 when item does not exist', async () => {
      mockRefService.delete.mockRejectedValue(
        new AppError({ code: 'REFERENCE_NOT_FOUND', message: 'Item nao encontrado', statusCode: 404 }),
      );

      const res = await app.inject({
        method: 'DELETE',
        url: `/projects/${VALID_UUID}/references/${VALID_REF_UUID}`,
        headers: { authorization: 'Bearer valid-token' },
      });

      expect(res.statusCode).toBe(404);
    });

    it('should return 401 without auth header', async () => {
      const res = await app.inject({
        method: 'DELETE',
        url: `/projects/${VALID_UUID}/references/${VALID_REF_UUID}`,
      });

      expect(res.statusCode).toBe(401);
    });

    it('should return 404 when project belongs to another user', async () => {
      mockRefService.delete.mockRejectedValue(
        new AppError({ code: 'PROJECT_NOT_FOUND', message: 'Projeto nao encontrado', statusCode: 404 }),
      );

      const res = await app.inject({
        method: 'DELETE',
        url: `/projects/${VALID_UUID}/references/${VALID_REF_UUID}`,
        headers: { authorization: 'Bearer valid-token' },
      });

      expect(res.statusCode).toBe(404);
    });
  });
});
