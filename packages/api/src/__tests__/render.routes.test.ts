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

vi.mock('../services/render.service', () => ({
  renderService: {
    createJob: vi.fn(),
    listJobs: vi.fn(),
    cancelJob: vi.fn(),
  },
}));

vi.mock('../services/consent.service', () => ({
  consentService: {
    hasConsent: vi.fn().mockResolvedValue(true),
  },
}));

import { renderRoutes } from '../routes/render.routes';
import { errorHandler } from '../middleware/error-handler';
import { renderService } from '../services/render.service';
import { supabaseAdmin } from '../lib/supabase';
import { AppError } from '../lib/errors';

const mockRenderService = vi.mocked(renderService);
const mockGetUser = vi.mocked(supabaseAdmin.auth.getUser);

const MOCK_USER = {
  id: 'user-123',
  email: 'test@example.com',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  created_at: '2024-01-01',
};

const authHeaders = { authorization: 'Bearer valid-token' };

const buildApp = async (): Promise<FastifyInstance> => {
  const app = Fastify({ logger: false });
  app.setErrorHandler(errorHandler);
  await app.register(renderRoutes);
  await app.ready();
  return app;
};

describe('render routes', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockGetUser.mockResolvedValue({
      data: { user: MOCK_USER },
      error: null,
    } as never);
    app = await buildApp();
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  describe('POST /projects/:id/generate', () => {
    it('should return 201 on successful render job creation', async () => {
      const mockJob = {
        id: 'render-job-1',
        project_id: '550e8400-e29b-41d4-a716-446655440000',
        type: 'initial',
        status: 'queued',
        priority: 10,
      };

      mockRenderService.createJob.mockResolvedValue(mockJob as never);

      const res = await app.inject({
        method: 'POST',
        url: '/projects/550e8400-e29b-41d4-a716-446655440000/generate',
        headers: authHeaders,
        payload: {
          type: 'initial',
          input_params: { style: 'modern' },
        },
      });

      expect(res.statusCode).toBe(201);
      const body = JSON.parse(res.body);
      expect(body.data.id).toBe('render-job-1');
      expect(body.data.status).toBe('queued');
    });

    it('should return 201 with default type when not specified', async () => {
      const mockJob = {
        id: 'render-job-2',
        type: 'initial',
        status: 'queued',
      };

      mockRenderService.createJob.mockResolvedValue(mockJob as never);

      const res = await app.inject({
        method: 'POST',
        url: '/projects/550e8400-e29b-41d4-a716-446655440000/generate',
        headers: authHeaders,
        payload: {},
      });

      expect(res.statusCode).toBe(201);
    });

    it('should return 429 when quota exceeded', async () => {
      mockRenderService.createJob.mockRejectedValue(
        new AppError({ code: 'QUOTA_EXCEEDED', message: 'Quota excedida', statusCode: 429 }),
      );

      const res = await app.inject({
        method: 'POST',
        url: '/projects/550e8400-e29b-41d4-a716-446655440000/generate',
        headers: authHeaders,
        payload: { type: 'initial' },
      });

      expect(res.statusCode).toBe(429);
      const body = JSON.parse(res.body);
      expect(body.error.code).toBe('QUOTA_EXCEEDED');
    });

    it('should return 503 when queue is unavailable', async () => {
      mockRenderService.createJob.mockRejectedValue(
        new AppError({ code: 'QUEUE_UNAVAILABLE', message: 'Queue down', statusCode: 503 }),
      );

      const res = await app.inject({
        method: 'POST',
        url: '/projects/550e8400-e29b-41d4-a716-446655440000/generate',
        headers: authHeaders,
        payload: { type: 'initial' },
      });

      expect(res.statusCode).toBe(503);
      const body = JSON.parse(res.body);
      expect(body.error.code).toBe('QUEUE_UNAVAILABLE');
    });

    it('should return 401 without auth header', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/projects/550e8400-e29b-41d4-a716-446655440000/generate',
        payload: { type: 'initial' },
      });

      expect(res.statusCode).toBe(401);
    });

    it('should return 400 on invalid project UUID', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/projects/not-a-uuid/generate',
        headers: authHeaders,
        payload: { type: 'initial' },
      });

      expect(res.statusCode).toBe(400);
    });

    it('should return 400 on invalid render type', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/projects/550e8400-e29b-41d4-a716-446655440000/generate',
        headers: authHeaders,
        payload: { type: 'invalid_type' },
      });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /projects/:id/render-jobs', () => {
    it('should return 200 with render jobs list', async () => {
      const mockJobs = [
        { id: 'job-1', status: 'completed', type: 'initial' },
        { id: 'job-2', status: 'queued', type: 'refinement' },
      ];

      mockRenderService.listJobs.mockResolvedValue(mockJobs as never);

      const res = await app.inject({
        method: 'GET',
        url: '/projects/550e8400-e29b-41d4-a716-446655440000/render-jobs',
        headers: authHeaders,
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body.data).toHaveLength(2);
    });

    it('should return 401 without auth', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/projects/550e8400-e29b-41d4-a716-446655440000/render-jobs',
      });

      expect(res.statusCode).toBe(401);
    });

    it('should return 404 when project not found', async () => {
      mockRenderService.listJobs.mockRejectedValue(
        new AppError({ code: 'PROJECT_NOT_FOUND', message: 'Projeto nao encontrado', statusCode: 404 }),
      );

      const res = await app.inject({
        method: 'GET',
        url: '/projects/550e8400-e29b-41d4-a716-446655440000/render-jobs',
        headers: authHeaders,
      });

      expect(res.statusCode).toBe(404);
    });
  });

  describe('POST /render-jobs/:id/cancel', () => {
    it('should return 200 on successful cancellation', async () => {
      mockRenderService.cancelJob.mockResolvedValue({
        id: '550e8400-e29b-41d4-a716-446655440000',
        status: 'canceled',
      });

      const res = await app.inject({
        method: 'POST',
        url: '/render-jobs/550e8400-e29b-41d4-a716-446655440000/cancel',
        headers: authHeaders,
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body.data.status).toBe('canceled');
    });

    it('should return 404 when job not found', async () => {
      mockRenderService.cancelJob.mockRejectedValue(
        new AppError({ code: 'RENDER_JOB_NOT_FOUND', message: 'Job nao encontrado', statusCode: 404 }),
      );

      const res = await app.inject({
        method: 'POST',
        url: '/render-jobs/550e8400-e29b-41d4-a716-446655440000/cancel',
        headers: authHeaders,
      });

      expect(res.statusCode).toBe(404);
    });

    it('should return 409 when job is not cancelable', async () => {
      mockRenderService.cancelJob.mockRejectedValue(
        new AppError({ code: 'RENDER_JOB_NOT_CANCELABLE', message: 'Job nao cancelavel', statusCode: 409 }),
      );

      const res = await app.inject({
        method: 'POST',
        url: '/render-jobs/550e8400-e29b-41d4-a716-446655440000/cancel',
        headers: authHeaders,
      });

      expect(res.statusCode).toBe(409);
    });

    it('should return 401 without auth', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/render-jobs/550e8400-e29b-41d4-a716-446655440000/cancel',
      });

      expect(res.statusCode).toBe(401);
    });

    it('should return 400 on invalid UUID', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/render-jobs/not-a-uuid/cancel',
        headers: authHeaders,
      });

      expect(res.statusCode).toBe(400);
    });
  });
});
