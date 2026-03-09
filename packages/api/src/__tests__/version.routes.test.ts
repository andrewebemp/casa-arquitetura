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

vi.mock('../services/version.service', () => ({
  versionService: {
    list: vi.fn(),
    getById: vi.fn(),
    revert: vi.fn(),
  },
}));

import { versionRoutes } from '../routes/version.routes';
import { errorHandler } from '../middleware/error-handler';
import { versionService } from '../services/version.service';
import { supabaseAdmin } from '../lib/supabase';
import { AppError } from '../lib/errors';

const mockVersionService = vi.mocked(versionService);
const mockGetUser = vi.mocked(supabaseAdmin.auth.getUser);

const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000';
const VERSION_UUID = '660e8400-e29b-41d4-a716-446655440000';
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
  server.register(versionRoutes, { prefix: '/projects' });
  await server.ready();
  return server;
}

function authHeaders() {
  return { authorization: 'Bearer valid-token' };
}

describe('version routes', () => {
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

  describe('GET /projects/:id/versions', () => {
    it('should return all versions ordered by version_number', async () => {
      const mockVersions = [
        { id: 'v1', version_number: 1, image_url: 'img1.jpg' },
        { id: 'v2', version_number: 2, image_url: 'img2.jpg' },
      ];

      mockVersionService.list.mockResolvedValue(mockVersions);

      const response = await app.inject({
        method: 'GET',
        url: `/projects/${VALID_UUID}/versions`,
        headers: authHeaders(),
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data).toHaveLength(2);
      expect(body.data[0].version_number).toBe(1);
    });

    it('should return empty array when no versions', async () => {
      mockVersionService.list.mockResolvedValue([]);

      const response = await app.inject({
        method: 'GET',
        url: `/projects/${VALID_UUID}/versions`,
        headers: authHeaders(),
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data).toEqual([]);
    });

    it('should return 401 without auth token', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/projects/${VALID_UUID}/versions`,
      });

      expect(response.statusCode).toBe(401);
    });

    it('should return 400 for invalid UUID', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/projects/invalid/versions',
        headers: authHeaders(),
      });

      expect(response.statusCode).toBe(400);
    });

    it('should return 403 when project not owned by user', async () => {
      mockVersionService.list.mockRejectedValue(
        new AppError({ code: 'PROJECT_NOT_FOUND', message: 'Not found', statusCode: 403 }),
      );

      const response = await app.inject({
        method: 'GET',
        url: `/projects/${VALID_UUID}/versions`,
        headers: authHeaders(),
      });

      expect(response.statusCode).toBe(403);
    });
  });

  describe('GET /projects/:id/versions/:versionId', () => {
    it('should return single version with metadata', async () => {
      const mockVersion = {
        id: VERSION_UUID,
        project_id: VALID_UUID,
        version_number: 1,
        image_url: 'img.jpg',
        metadata: { type: 'initial' },
      };

      mockVersionService.getById.mockResolvedValue(mockVersion);

      const response = await app.inject({
        method: 'GET',
        url: `/projects/${VALID_UUID}/versions/${VERSION_UUID}`,
        headers: authHeaders(),
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data.id).toBe(VERSION_UUID);
      expect(body.data.version_number).toBe(1);
    });

    it('should return 404 when version not found', async () => {
      mockVersionService.getById.mockRejectedValue(
        new AppError({ code: 'VERSION_NOT_FOUND', message: 'Not found', statusCode: 404 }),
      );

      const response = await app.inject({
        method: 'GET',
        url: `/projects/${VALID_UUID}/versions/${VERSION_UUID}`,
        headers: authHeaders(),
      });

      expect(response.statusCode).toBe(404);
    });

    it('should return 400 for invalid version UUID', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/projects/${VALID_UUID}/versions/invalid`,
        headers: authHeaders(),
      });

      expect(response.statusCode).toBe(400);
    });

    it('should return 401 without auth token', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/projects/${VALID_UUID}/versions/${VERSION_UUID}`,
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('POST /projects/:id/versions/:versionId/revert', () => {
    it('should create new version and return 201', async () => {
      const mockNewVersion = {
        id: 'v-new',
        project_id: VALID_UUID,
        version_number: 4,
        image_url: 'img2.jpg',
        refinement_command: 'revert_to_v2',
      };

      mockVersionService.revert.mockResolvedValue(mockNewVersion);

      const response = await app.inject({
        method: 'POST',
        url: `/projects/${VALID_UUID}/versions/${VERSION_UUID}/revert`,
        headers: authHeaders(),
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body.data.version_number).toBe(4);
      expect(body.data.refinement_command).toBe('revert_to_v2');
    });

    it('should pass correct arguments to versionService.revert', async () => {
      mockVersionService.revert.mockResolvedValue({ id: 'v-new' });

      await app.inject({
        method: 'POST',
        url: `/projects/${VALID_UUID}/versions/${VERSION_UUID}/revert`,
        headers: authHeaders(),
      });

      expect(mockVersionService.revert).toHaveBeenCalledWith(
        VALID_UUID,
        VERSION_UUID,
        'user-1',
        'valid-token',
      );
    });

    it('should return 404 when version not found', async () => {
      mockVersionService.revert.mockRejectedValue(
        new AppError({ code: 'VERSION_NOT_FOUND', message: 'Not found', statusCode: 404 }),
      );

      const response = await app.inject({
        method: 'POST',
        url: `/projects/${VALID_UUID}/versions/${VERSION_UUID}/revert`,
        headers: authHeaders(),
      });

      expect(response.statusCode).toBe(404);
    });

    it('should return 403 when project not owned', async () => {
      mockVersionService.revert.mockRejectedValue(
        new AppError({ code: 'PROJECT_NOT_FOUND', message: 'Not found', statusCode: 403 }),
      );

      const response = await app.inject({
        method: 'POST',
        url: `/projects/${VALID_UUID}/versions/${VERSION_UUID}/revert`,
        headers: authHeaders(),
      });

      expect(response.statusCode).toBe(403);
    });

    it('should return 401 without auth token', async () => {
      const response = await app.inject({
        method: 'POST',
        url: `/projects/${VALID_UUID}/versions/${VERSION_UUID}/revert`,
      });

      expect(response.statusCode).toBe(401);
    });

    it('should return 400 for invalid UUIDs', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/projects/invalid/versions/also-invalid/revert',
        headers: authHeaders(),
      });

      expect(response.statusCode).toBe(400);
    });
  });
});
