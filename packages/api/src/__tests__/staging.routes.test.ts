import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';
import Fastify from 'fastify';
import multipart from '@fastify/multipart';
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

vi.mock('../services/staging.service', () => ({
  stagingService: {
    generate: vi.fn(),
    variation: vi.fn(),
    processJob: vi.fn(),
  },
}));

import { stagingRoutes, stagingStylesRoutes } from '../routes/staging.routes';
import { errorHandler } from '../middleware/error-handler';
import { stagingService } from '../services/staging.service';
import { supabaseAdmin } from '../lib/supabase';
import { AppError } from '../lib/errors';

const mockStagingService = vi.mocked(stagingService);
const mockGetUser = vi.mocked(supabaseAdmin.auth.getUser);

const MOCK_USER = {
  id: 'user-123',
  email: 'test@example.com',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  created_at: '2024-01-01',
};

const PROJECT_UUID = '550e8400-e29b-41d4-a716-446655440000';
const authHeaders = { authorization: 'Bearer valid-token' };

const buildApp = async (): Promise<FastifyInstance> => {
  const app = Fastify({ logger: false });
  app.setErrorHandler(errorHandler);
  app.register(multipart, { limits: { fileSize: 20 * 1024 * 1024 } });
  await app.register(stagingStylesRoutes, { prefix: '/api/staging' });
  await app.register(stagingRoutes, { prefix: '/api/projects' });
  await app.ready();
  return app;
};

describe('staging routes', () => {
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

  describe('GET /api/staging/styles', () => {
    it('should return 200 with all 10 styles', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/staging/styles',
        headers: authHeaders,
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body.data).toHaveLength(10);

      const ids = body.data.map((s: { id: string }) => s.id);
      expect(ids).toContain('moderno');
      expect(ids).toContain('industrial');
      expect(ids).toContain('minimalista');
      expect(ids).toContain('classico');
      expect(ids).toContain('escandinavo');
      expect(ids).toContain('rustico');
      expect(ids).toContain('tropical');
      expect(ids).toContain('contemporaneo');
      expect(ids).toContain('boho');
      expect(ids).toContain('luxo');
    });

    it('should return styles with all required fields', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/staging/styles',
        headers: authHeaders,
      });

      const body = JSON.parse(res.body);
      for (const style of body.data) {
        expect(style).toHaveProperty('id');
        expect(style).toHaveProperty('name');
        expect(style).toHaveProperty('description');
        expect(style).toHaveProperty('preview_url');
        expect(style).toHaveProperty('prompt_modifier');
      }
    });

    it('should return 401 without auth', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/staging/styles',
      });

      expect(res.statusCode).toBe(401);
    });
  });

  describe('POST /api/projects/:projectId/staging/generate', () => {
    it('should return 202 on successful staging generation', async () => {
      mockStagingService.generate.mockResolvedValue({
        job_id: 'staging-job-1',
        status: 'queued',
        style_id: 'moderno',
        resolution: '1024x1024',
      });

      const boundary = '----FormBoundary';
      const payload = [
        `--${boundary}`,
        'Content-Disposition: form-data; name="style_id"',
        '',
        'moderno',
        `--${boundary}`,
        'Content-Disposition: form-data; name="file"; filename="room.jpg"',
        'Content-Type: image/jpeg',
        '',
        'fake-jpeg-content',
        `--${boundary}--`,
      ].join('\r\n');

      const res = await app.inject({
        method: 'POST',
        url: `/api/projects/${PROJECT_UUID}/staging/generate`,
        headers: {
          ...authHeaders,
          'content-type': `multipart/form-data; boundary=${boundary}`,
        },
        payload,
      });

      expect(res.statusCode).toBe(202);
      const body = JSON.parse(res.body);
      expect(body.data.job_id).toBe('staging-job-1');
      expect(body.data.status).toBe('queued');
    });

    it('should return error when no file is uploaded', async () => {
      const res = await app.inject({
        method: 'POST',
        url: `/api/projects/${PROJECT_UUID}/staging/generate`,
        headers: authHeaders,
      });

      // Without multipart content-type, fastify returns 400 or 406
      expect([400, 406]).toContain(res.statusCode);
    });

    it('should return 429 when quota exceeded', async () => {
      mockStagingService.generate.mockRejectedValue(
        new AppError({ code: 'QUOTA_EXCEEDED', message: 'Quota excedida', statusCode: 429 }),
      );

      const boundary = '----FormBoundary';
      const payload = [
        `--${boundary}`,
        'Content-Disposition: form-data; name="style_id"',
        '',
        'moderno',
        `--${boundary}`,
        'Content-Disposition: form-data; name="file"; filename="room.jpg"',
        'Content-Type: image/jpeg',
        '',
        'fake-jpeg-content',
        `--${boundary}--`,
      ].join('\r\n');

      const res = await app.inject({
        method: 'POST',
        url: `/api/projects/${PROJECT_UUID}/staging/generate`,
        headers: {
          ...authHeaders,
          'content-type': `multipart/form-data; boundary=${boundary}`,
        },
        payload,
      });

      expect(res.statusCode).toBe(429);
    });

    it('should return 401 without auth', async () => {
      const res = await app.inject({
        method: 'POST',
        url: `/api/projects/${PROJECT_UUID}/staging/generate`,
      });

      expect(res.statusCode).toBe(401);
    });

    it('should return 400 on invalid project UUID', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/projects/not-a-uuid/staging/generate',
        headers: authHeaders,
      });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('POST /api/projects/:projectId/staging/variation', () => {
    it('should return 202 on successful variation', async () => {
      mockStagingService.variation.mockResolvedValue({
        job_id: 'variation-job-1',
        status: 'queued',
        style_id: 'industrial',
        resolution: '1024x1024',
        reused_depth_map: true,
      });

      const res = await app.inject({
        method: 'POST',
        url: `/api/projects/${PROJECT_UUID}/staging/variation`,
        headers: authHeaders,
        payload: { style_id: 'industrial' },
      });

      expect(res.statusCode).toBe(202);
      const body = JSON.parse(res.body);
      expect(body.data.job_id).toBe('variation-job-1');
      expect(body.data.reused_depth_map).toBe(true);
    });

    it('should return 400 on invalid style_id', async () => {
      const res = await app.inject({
        method: 'POST',
        url: `/api/projects/${PROJECT_UUID}/staging/variation`,
        headers: authHeaders,
        payload: { style_id: 'invalid_style' },
      });

      expect(res.statusCode).toBe(400);
    });

    it('should return 409 when no existing render', async () => {
      mockStagingService.variation.mockRejectedValue(
        new AppError({ code: 'NO_EXISTING_RENDER', message: 'Sem render existente', statusCode: 409 }),
      );

      const res = await app.inject({
        method: 'POST',
        url: `/api/projects/${PROJECT_UUID}/staging/variation`,
        headers: authHeaders,
        payload: { style_id: 'industrial' },
      });

      expect(res.statusCode).toBe(409);
    });

    it('should return 401 without auth', async () => {
      const res = await app.inject({
        method: 'POST',
        url: `/api/projects/${PROJECT_UUID}/staging/variation`,
        payload: { style_id: 'moderno' },
      });

      expect(res.statusCode).toBe(401);
    });

    it('should return 400 on invalid project UUID', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/projects/not-a-uuid/staging/variation',
        headers: authHeaders,
        payload: { style_id: 'moderno' },
      });

      expect(res.statusCode).toBe(400);
    });

    it('should return 429 when quota exceeded', async () => {
      mockStagingService.variation.mockRejectedValue(
        new AppError({ code: 'QUOTA_EXCEEDED', message: 'Quota excedida', statusCode: 429 }),
      );

      const res = await app.inject({
        method: 'POST',
        url: `/api/projects/${PROJECT_UUID}/staging/variation`,
        headers: authHeaders,
        payload: { style_id: 'moderno' },
      });

      expect(res.statusCode).toBe(429);
    });
  });
});
