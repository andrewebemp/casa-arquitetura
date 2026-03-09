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

vi.mock('../services/croqui.service', () => ({
  croquiService: {
    generate: vi.fn(),
    getCroqui: vi.fn(),
    adjust: vi.fn(),
    approve: vi.fn(),
  },
}));

vi.mock('../services/photo-analysis.service', () => ({
  photoAnalysisService: {
    analyze: vi.fn(),
  },
}));

import { croquiRoutes } from '../routes/croqui.routes';
import { errorHandler } from '../middleware/error-handler';
import { croquiService } from '../services/croqui.service';
import { photoAnalysisService } from '../services/photo-analysis.service';
import { supabaseAdmin } from '../lib/supabase';
import { AppError } from '../lib/errors';

const mockCroquiService = vi.mocked(croquiService);
const mockPhotoService = vi.mocked(photoAnalysisService);
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

let app: FastifyInstance;

async function buildApp() {
  const server = Fastify();
  server.setErrorHandler(errorHandler);
  server.register(croquiRoutes, { prefix: '/projects' });
  await server.ready();
  return server;
}

function authHeaders() {
  return { authorization: 'Bearer valid-token' };
}

describe('croqui routes', () => {
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

  describe('POST /projects/:id/analyze', () => {
    it('should analyze photo and return spatial data + croqui', async () => {
      const mockResult = {
        spatial_data: {
          dimensions: { width: 5, length: 7, height: 2.8 },
          openings: [{ type: 'door', wall: 'south', width: 0.9, height: 2.1 }],
          detected_elements: ['door'],
          photo_interpretation: {},
        },
        croqui: {
          croqui_ascii: '+------+\n|      |\n+--D---+',
          turn_number: 1,
          approved: false,
        },
      };

      mockPhotoService.analyze.mockResolvedValue(mockResult);

      const response = await app.inject({
        method: 'POST',
        url: `/projects/${VALID_UUID}/analyze`,
        headers: authHeaders(),
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data.croqui.croqui_ascii).toBe(mockResult.croqui.croqui_ascii);
      expect(body.data.croqui.turn_number).toBe(1);
    });

    it('should return 401 without auth token', async () => {
      const response = await app.inject({
        method: 'POST',
        url: `/projects/${VALID_UUID}/analyze`,
      });

      expect(response.statusCode).toBe(401);
    });

    it('should return 400 for invalid UUID', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/projects/not-a-uuid/analyze',
        headers: authHeaders(),
      });

      expect(response.statusCode).toBe(400);
    });

    it('should propagate service errors', async () => {
      mockPhotoService.analyze.mockRejectedValue(
        new AppError({ code: 'PHOTO_NOT_FOUND', message: 'No photo', statusCode: 400 }),
      );

      const response = await app.inject({
        method: 'POST',
        url: `/projects/${VALID_UUID}/analyze`,
        headers: authHeaders(),
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.error.code).toBe('PHOTO_NOT_FOUND');
    });
  });

  describe('GET /projects/:id/croqui', () => {
    it('should return current croqui', async () => {
      const mockData = {
        croqui_ascii: '+------+\n|      |\n+------+',
        turn_number: 2,
        approved: false,
        dimensions: { width: 4, length: 6, height: 2.8 },
        openings: [],
        items: [],
      };

      mockCroquiService.getCroqui.mockResolvedValue(mockData);

      const response = await app.inject({
        method: 'GET',
        url: `/projects/${VALID_UUID}/croqui`,
        headers: authHeaders(),
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data.croqui_ascii).toBe(mockData.croqui_ascii);
      expect(body.data.turn_number).toBe(2);
    });

    it('should return 404 when croqui not found', async () => {
      mockCroquiService.getCroqui.mockRejectedValue(
        new AppError({ code: 'CROQUI_NOT_FOUND', message: 'Not found', statusCode: 404 }),
      );

      const response = await app.inject({
        method: 'GET',
        url: `/projects/${VALID_UUID}/croqui`,
        headers: authHeaders(),
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('POST /projects/:id/croqui/adjust', () => {
    it('should adjust croqui with instructions', async () => {
      const mockResult = {
        croqui_ascii: '+------+\n| Sofa |\n+------+',
        turn_number: 2,
        approved: false,
      };

      mockCroquiService.adjust.mockResolvedValue(mockResult);

      const response = await app.inject({
        method: 'POST',
        url: `/projects/${VALID_UUID}/croqui/adjust`,
        headers: { ...authHeaders(), 'content-type': 'application/json' },
        body: JSON.stringify({ instructions: 'add a sofa in the center' }),
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data.turn_number).toBe(2);
      expect(mockCroquiService.adjust).toHaveBeenCalledWith(
        VALID_UUID,
        'user-1',
        'add a sofa in the center',
        'valid-token',
      );
    });

    it('should return 400 for missing instructions', async () => {
      const response = await app.inject({
        method: 'POST',
        url: `/projects/${VALID_UUID}/croqui/adjust`,
        headers: { ...authHeaders(), 'content-type': 'application/json' },
        body: JSON.stringify({}),
      });

      expect(response.statusCode).toBe(400);
    });

    it('should return 422 when max turns reached', async () => {
      mockCroquiService.adjust.mockRejectedValue(
        new AppError({
          code: 'CROQUI_MAX_TURNS_REACHED',
          message: 'Max turns',
          statusCode: 422,
        }),
      );

      const response = await app.inject({
        method: 'POST',
        url: `/projects/${VALID_UUID}/croqui/adjust`,
        headers: { ...authHeaders(), 'content-type': 'application/json' },
        body: JSON.stringify({ instructions: 'move sofa' }),
      });

      expect(response.statusCode).toBe(422);
    });
  });

  describe('POST /projects/:id/croqui/approve', () => {
    it('should approve croqui and return confirmation', async () => {
      const mockResult = {
        approved: true,
        croqui_ascii: '+------+\n|      |\n+------+',
        turn_number: 1,
        version_id: 'version-1',
      };

      mockCroquiService.approve.mockResolvedValue(mockResult);

      const response = await app.inject({
        method: 'POST',
        url: `/projects/${VALID_UUID}/croqui/approve`,
        headers: authHeaders(),
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data.approved).toBe(true);
      expect(body.data.version_id).toBe('version-1');
    });

    it('should return 409 when already approved', async () => {
      mockCroquiService.approve.mockRejectedValue(
        new AppError({
          code: 'CROQUI_ALREADY_APPROVED',
          message: 'Already approved',
          statusCode: 409,
        }),
      );

      const response = await app.inject({
        method: 'POST',
        url: `/projects/${VALID_UUID}/croqui/approve`,
        headers: authHeaders(),
      });

      expect(response.statusCode).toBe(409);
    });
  });
});
