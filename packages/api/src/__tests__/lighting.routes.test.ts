import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';
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
    from: vi.fn(),
    auth: { getUser: vi.fn() },
  },
  createUserClient: vi.fn(),
}));

vi.mock('../services/lighting.service', () => ({
  lightingService: {
    analyzeLighting: vi.fn(),
  },
}));

vi.mock('../services/consent.service', () => ({
  consentService: {
    hasConsent: vi.fn().mockResolvedValue(true),
  },
}));

import { lightingRoutes } from '../routes/lighting.routes';
import { errorHandler } from '../middleware/error-handler';
import { supabaseAdmin } from '../lib/supabase';
import { lightingService } from '../services/lighting.service';
import { AppError } from '../lib/errors';

const mockGetUser = vi.mocked(supabaseAdmin.auth.getUser);
const mockAnalyzeLighting = vi.mocked(lightingService.analyzeLighting);

const MOCK_USER = {
  id: 'user-123',
  email: 'test@example.com',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  created_at: '2024-01-01',
};

const authHeaders = { authorization: 'Bearer valid-token' };
const validProjectId = '550e8400-e29b-41d4-a716-446655440000';
const validVersionId = '660e8400-e29b-41d4-a716-446655440000';

const buildApp = async (): Promise<FastifyInstance> => {
  const app = Fastify({ logger: false });
  app.setErrorHandler(errorHandler);
  await app.register(lightingRoutes, { prefix: '/api/projects' });
  await app.ready();
  return app;
};

describe('lighting routes', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockGetUser.mockResolvedValue({ data: { user: MOCK_USER }, error: null } as never);
    app = await buildApp();
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  describe('POST /api/projects/:projectId/enhance-lighting', () => {
    it('should return 200 with assessment when no job created', async () => {
      mockAnalyzeLighting.mockResolvedValue({
        assessment: {
          brightness_score: 75,
          exposure_level: 'normal',
          lighting_issues: [],
          needs_enhancement: false,
        },
        job_id: null,
        status: 'analysis_complete',
      });

      const res = await app.inject({
        method: 'POST',
        url: `/api/projects/${validProjectId}/enhance-lighting`,
        headers: authHeaders,
        payload: {
          image_version_id: validVersionId,
          mode: 'auto',
        },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body.data.assessment.brightness_score).toBe(75);
      expect(body.data.assessment.needs_enhancement).toBe(false);
      expect(body.data.job_id).toBeNull();
    });

    it('should return 202 when enhancement job created', async () => {
      mockAnalyzeLighting.mockResolvedValue({
        assessment: {
          brightness_score: 25,
          exposure_level: 'underexposed',
          lighting_issues: ['underexposed', 'poor_shadow_detail'],
          needs_enhancement: true,
        },
        job_id: 'light-job-1',
        status: 'queued',
      });

      const res = await app.inject({
        method: 'POST',
        url: `/api/projects/${validProjectId}/enhance-lighting`,
        headers: authHeaders,
        payload: {
          image_version_id: validVersionId,
          mode: 'natural',
          auto_enhance: true,
        },
      });

      expect(res.statusCode).toBe(202);
      const body = JSON.parse(res.body);
      expect(body.data.job_id).toBe('light-job-1');
      expect(body.data.assessment.needs_enhancement).toBe(true);
    });

    it('should return 401 when no auth token', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null }, error: { message: 'invalid' } } as never);

      const res = await app.inject({
        method: 'POST',
        url: `/api/projects/${validProjectId}/enhance-lighting`,
        payload: {
          image_version_id: validVersionId,
        },
      });

      expect(res.statusCode).toBe(401);
    });

    it('should return 400 for invalid projectId', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/projects/not-a-uuid/enhance-lighting',
        headers: authHeaders,
        payload: {
          image_version_id: validVersionId,
        },
      });

      expect(res.statusCode).toBe(400);
    });

    it('should return 400 for invalid image_version_id', async () => {
      const res = await app.inject({
        method: 'POST',
        url: `/api/projects/${validProjectId}/enhance-lighting`,
        headers: authHeaders,
        payload: {
          image_version_id: 'not-a-uuid',
        },
      });

      expect(res.statusCode).toBe(400);
    });

    it('should return 403 when project not owned by user', async () => {
      mockAnalyzeLighting.mockRejectedValue(
        new AppError({
          code: 'PROJECT_NOT_FOUND',
          message: 'Projeto nao encontrado ou acesso negado',
          statusCode: 403,
        }),
      );

      const res = await app.inject({
        method: 'POST',
        url: `/api/projects/${validProjectId}/enhance-lighting`,
        headers: authHeaders,
        payload: {
          image_version_id: validVersionId,
        },
      });

      expect(res.statusCode).toBe(403);
    });

    it('should accept all three lighting modes', async () => {
      mockAnalyzeLighting.mockResolvedValue({
        assessment: {
          brightness_score: 50,
          exposure_level: 'normal',
          lighting_issues: [],
          needs_enhancement: true,
        },
        job_id: null,
        status: 'analysis_complete',
      });

      for (const mode of ['auto', 'natural', 'warm']) {
        const res = await app.inject({
          method: 'POST',
          url: `/api/projects/${validProjectId}/enhance-lighting`,
          headers: authHeaders,
          payload: {
            image_version_id: validVersionId,
            mode,
          },
        });

        expect(res.statusCode).toBe(200);
      }
    });

    it('should default to auto mode when not specified', async () => {
      mockAnalyzeLighting.mockResolvedValue({
        assessment: {
          brightness_score: 50,
          exposure_level: 'normal',
          lighting_issues: [],
          needs_enhancement: true,
        },
        job_id: null,
        status: 'analysis_complete',
      });

      const res = await app.inject({
        method: 'POST',
        url: `/api/projects/${validProjectId}/enhance-lighting`,
        headers: authHeaders,
        payload: {
          image_version_id: validVersionId,
        },
      });

      expect(res.statusCode).toBe(200);
      expect(mockAnalyzeLighting).toHaveBeenCalledWith(
        expect.objectContaining({ mode: 'auto' }),
      );
    });
  });
});
