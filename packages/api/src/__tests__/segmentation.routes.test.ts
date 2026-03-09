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

vi.mock('../services/segmentation.service', () => ({
  segmentationService: {
    segmentPoint: vi.fn(),
    segmentAll: vi.fn(),
    applyMaterialSwap: vi.fn(),
    getSuggestedMaterials: vi.fn(),
  },
}));

import { segmentationRoutes } from '../routes/segmentation.routes';
import { errorHandler } from '../middleware/error-handler';
import { supabaseAdmin } from '../lib/supabase';
import { segmentationService } from '../services/segmentation.service';

const mockGetUser = vi.mocked(supabaseAdmin.auth.getUser);
const mockSegmentPoint = vi.mocked(segmentationService.segmentPoint);
const mockSegmentAll = vi.mocked(segmentationService.segmentAll);
const mockApplySwap = vi.mocked(segmentationService.applyMaterialSwap);
const mockGetMaterials = vi.mocked(segmentationService.getSuggestedMaterials);

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
  await app.register(segmentationRoutes, { prefix: '/api/projects' });
  await app.ready();
  return app;
};

describe('segmentation routes', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockGetUser.mockResolvedValue({ data: { user: MOCK_USER }, error: null } as never);
    app = await buildApp();
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  describe('POST /api/projects/:projectId/segment', () => {
    const validProjectId = '550e8400-e29b-41d4-a716-446655440000';

    it('should return 200 with segment data on success', async () => {
      mockSegmentPoint.mockResolvedValue({
        segment_id: 'seg-1',
        label: 'wall',
        category: 'wall',
        mask_url: 'https://storage.com/mask.png',
        polygon: [{ x: 0, y: 0 }],
        bounding_box: { x: 0, y: 0, width: 100, height: 100 },
        confidence: 0.95,
      });

      const res = await app.inject({
        method: 'POST',
        url: `/api/projects/${validProjectId}/segment`,
        headers: authHeaders,
        payload: { x: 50, y: 50 },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body.data.segment_id).toBe('seg-1');
      expect(body.data.category).toBe('wall');
    });

    it('should return 401 when no auth token', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null }, error: { message: 'invalid' } } as never);

      const res = await app.inject({
        method: 'POST',
        url: `/api/projects/${validProjectId}/segment`,
        payload: { x: 50, y: 50 },
      });

      expect(res.statusCode).toBe(401);
    });

    it('should return 400 for invalid projectId', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/projects/not-a-uuid/segment',
        headers: authHeaders,
        payload: { x: 50, y: 50 },
      });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('POST /api/projects/:projectId/segment/all', () => {
    const validProjectId = '550e8400-e29b-41d4-a716-446655440000';

    it('should return 200 with all segments', async () => {
      mockSegmentAll.mockResolvedValue([
        {
          segment_id: 'seg-1',
          label: 'wall',
          category: 'wall',
          mask_url: 'https://storage.com/mask1.png',
          polygon: [{ x: 0, y: 0 }],
          bounding_box: { x: 0, y: 0, width: 100, height: 100 },
          confidence: 0.95,
        },
        {
          segment_id: 'seg-2',
          label: 'floor',
          category: 'floor',
          mask_url: 'https://storage.com/mask2.png',
          polygon: [{ x: 0, y: 0 }],
          bounding_box: { x: 0, y: 200, width: 100, height: 50 },
          confidence: 0.88,
        },
      ]);

      const res = await app.inject({
        method: 'POST',
        url: `/api/projects/${validProjectId}/segment/all`,
        headers: authHeaders,
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body.data).toHaveLength(2);
      expect(body.data[0].segment_id).toBe('seg-1');
      expect(body.data[1].segment_id).toBe('seg-2');
    });
  });

  describe('POST /api/projects/:projectId/segment/apply', () => {
    const validProjectId = '550e8400-e29b-41d4-a716-446655440000';

    it('should return 202 on successful material swap request', async () => {
      mockApplySwap.mockResolvedValue({
        job_id: 'seg-job-1',
        status: 'queued',
        segment_id: 'seg-1',
        material_descriptor: 'dark hardwood floor',
      });

      const res = await app.inject({
        method: 'POST',
        url: `/api/projects/${validProjectId}/segment/apply`,
        headers: authHeaders,
        payload: {
          segment_id: 'seg-1',
          material_descriptor: 'dark hardwood floor',
        },
      });

      expect(res.statusCode).toBe(202);
      const body = JSON.parse(res.body);
      expect(body.data.job_id).toBe('seg-job-1');
      expect(body.data.status).toBe('queued');
    });

    it('should return 400 for missing segment_id', async () => {
      const res = await app.inject({
        method: 'POST',
        url: `/api/projects/${validProjectId}/segment/apply`,
        headers: authHeaders,
        payload: { material_descriptor: 'white marble' },
      });

      expect(res.statusCode).toBe(400);
    });

    it('should return 400 for missing material_descriptor', async () => {
      const res = await app.inject({
        method: 'POST',
        url: `/api/projects/${validProjectId}/segment/apply`,
        headers: authHeaders,
        payload: { segment_id: 'seg-1' },
      });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /api/projects/:projectId/segment/:segmentId/materials', () => {
    const validProjectId = '550e8400-e29b-41d4-a716-446655440000';

    it('should return 200 with suggested materials', async () => {
      mockGetMaterials.mockReturnValue([
        { id: 'wall-white-paint', name: 'Tinta Branca', description: 'Pintura branca', category: 'wall' },
        { id: 'wall-light-gray', name: 'Cinza Claro', description: 'Pintura cinza claro', category: 'wall' },
      ]);

      const res = await app.inject({
        method: 'GET',
        url: `/api/projects/${validProjectId}/segment/wall/materials`,
        headers: authHeaders,
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body.data).toHaveLength(2);
      expect(body.data[0].id).toBe('wall-white-paint');
    });
  });
});
