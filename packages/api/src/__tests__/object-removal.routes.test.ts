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

vi.mock('../services/object-removal.service', () => ({
  objectRemovalService: {
    selectObject: vi.fn(),
    applyRemoval: vi.fn(),
    applyBatchRemoval: vi.fn(),
  },
}));

import { objectRemovalRoutes } from '../routes/object-removal.routes';
import { errorHandler } from '../middleware/error-handler';
import { supabaseAdmin } from '../lib/supabase';
import { objectRemovalService } from '../services/object-removal.service';

const mockGetUser = vi.mocked(supabaseAdmin.auth.getUser);
const mockSelectObject = vi.mocked(objectRemovalService.selectObject);
const mockApplyRemoval = vi.mocked(objectRemovalService.applyRemoval);
const mockApplyBatch = vi.mocked(objectRemovalService.applyBatchRemoval);

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

const buildApp = async (): Promise<FastifyInstance> => {
  const app = Fastify({ logger: false });
  app.setErrorHandler(errorHandler);
  await app.register(objectRemovalRoutes, { prefix: '/api/projects' });
  await app.ready();
  return app;
};

describe('object-removal routes', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockGetUser.mockResolvedValue({ data: { user: MOCK_USER }, error: null } as never);
    app = await buildApp();
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  describe('POST /api/projects/:projectId/remove-object', () => {
    it('should return 200 with mask preview for point selection (AC1)', async () => {
      mockSelectObject.mockResolvedValue({
        mask_id: 'mask-1',
        mask_url: 'https://storage.com/mask.png',
        label: 'chair',
        category: 'furniture_large',
        bounding_box: { x: 10, y: 10, width: 80, height: 80 },
        confidence: 0.92,
      });

      const res = await app.inject({
        method: 'POST',
        url: `/api/projects/${validProjectId}/remove-object`,
        headers: authHeaders,
        payload: { x: 50, y: 50 },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body.data.mask_id).toBe('mask-1');
      expect(body.data.label).toBe('chair');
      expect(body.data.confidence).toBe(0.92);
    });

    it('should return 200 with mask preview for bounding box selection (AC2)', async () => {
      mockSelectObject.mockResolvedValue({
        mask_id: 'mask-2',
        mask_url: 'https://storage.com/mask2.png',
        label: 'table',
        category: 'furniture_large',
        bounding_box: { x: 20, y: 20, width: 100, height: 60 },
        confidence: 0.88,
      });

      const res = await app.inject({
        method: 'POST',
        url: `/api/projects/${validProjectId}/remove-object`,
        headers: authHeaders,
        payload: { bounding_box: { x1: 20, y1: 20, x2: 120, y2: 80 } },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body.data.mask_id).toBe('mask-2');
    });

    it('should return 401 when no auth token', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null }, error: { message: 'invalid' } } as never);

      const res = await app.inject({
        method: 'POST',
        url: `/api/projects/${validProjectId}/remove-object`,
        payload: { x: 50, y: 50 },
      });

      expect(res.statusCode).toBe(401);
    });

    it('should return 400 for invalid projectId', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/projects/not-a-uuid/remove-object',
        headers: authHeaders,
        payload: { x: 50, y: 50 },
      });

      expect(res.statusCode).toBe(400);
    });

    it('should return 400 when neither point nor bounding_box provided', async () => {
      const res = await app.inject({
        method: 'POST',
        url: `/api/projects/${validProjectId}/remove-object`,
        headers: authHeaders,
        payload: {},
      });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('POST /api/projects/:projectId/remove-object/apply', () => {
    it('should return 202 on successful apply (AC3)', async () => {
      mockApplyRemoval.mockResolvedValue({
        job_id: 'rem-job-1',
        status: 'queued',
        mask_id: 'mask-1',
        fill_mode: 'auto',
      });

      const res = await app.inject({
        method: 'POST',
        url: `/api/projects/${validProjectId}/remove-object/apply`,
        headers: authHeaders,
        payload: { mask_id: 'mask-1', fill_mode: 'auto' },
      });

      expect(res.statusCode).toBe(202);
      const body = JSON.parse(res.body);
      expect(body.data.job_id).toBe('rem-job-1');
      expect(body.data.fill_mode).toBe('auto');
    });

    it('should default fill_mode to auto when not specified', async () => {
      mockApplyRemoval.mockResolvedValue({
        job_id: 'rem-job-2',
        status: 'queued',
        mask_id: 'mask-1',
        fill_mode: 'auto',
      });

      const res = await app.inject({
        method: 'POST',
        url: `/api/projects/${validProjectId}/remove-object/apply`,
        headers: authHeaders,
        payload: { mask_id: 'mask-1' },
      });

      expect(res.statusCode).toBe(202);
    });

    it('should return 400 for missing mask_id', async () => {
      const res = await app.inject({
        method: 'POST',
        url: `/api/projects/${validProjectId}/remove-object/apply`,
        headers: authHeaders,
        payload: { fill_mode: 'wall' },
      });

      expect(res.statusCode).toBe(400);
    });

    it('should return 400 for invalid fill_mode', async () => {
      const res = await app.inject({
        method: 'POST',
        url: `/api/projects/${validProjectId}/remove-object/apply`,
        headers: authHeaders,
        payload: { mask_id: 'mask-1', fill_mode: 'invalid_mode' },
      });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('POST /api/projects/:projectId/remove-object/batch', () => {
    it('should return 202 on successful batch (AC4)', async () => {
      mockApplyBatch.mockResolvedValue({
        job_id: 'batch-job-1',
        status: 'queued',
        removals_count: 3,
      });

      const res = await app.inject({
        method: 'POST',
        url: `/api/projects/${validProjectId}/remove-object/batch`,
        headers: authHeaders,
        payload: {
          removals: [
            { mask_id: 'mask-1', fill_mode: 'auto' },
            { mask_id: 'mask-2', fill_mode: 'floor' },
            { mask_id: 'mask-3', fill_mode: 'wall' },
          ],
        },
      });

      expect(res.statusCode).toBe(202);
      const body = JSON.parse(res.body);
      expect(body.data.job_id).toBe('batch-job-1');
      expect(body.data.removals_count).toBe(3);
    });

    it('should return 400 for empty removals array', async () => {
      const res = await app.inject({
        method: 'POST',
        url: `/api/projects/${validProjectId}/remove-object/batch`,
        headers: authHeaders,
        payload: { removals: [] },
      });

      expect(res.statusCode).toBe(400);
    });

    it('should return 400 for missing mask_id in batch item', async () => {
      const res = await app.inject({
        method: 'POST',
        url: `/api/projects/${validProjectId}/remove-object/batch`,
        headers: authHeaders,
        payload: {
          removals: [{ fill_mode: 'auto' }],
        },
      });

      expect(res.statusCode).toBe(400);
    });
  });
});
