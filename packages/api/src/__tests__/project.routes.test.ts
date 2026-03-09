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

vi.mock('../services/project.service', () => ({
  projectService: {
    create: vi.fn(),
    list: vi.fn(),
    getById: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    updateImageUrl: vi.fn(),
  },
}));

vi.mock('../services/storage.service', () => ({
  storageService: {
    validateFile: vi.fn(),
    upload: vi.fn(),
    verifyProjectOwnership: vi.fn(),
  },
}));

import { projectRoutes } from '../routes/project.routes';
import { errorHandler } from '../middleware/error-handler';
import { projectService } from '../services/project.service';
import { storageService } from '../services/storage.service';
import { supabaseAdmin } from '../lib/supabase';
import { AppError } from '../lib/errors';

const mockProjectService = vi.mocked(projectService);
const mockStorageService = vi.mocked(storageService);
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
  await app.register(multipart, { limits: { fileSize: 20 * 1024 * 1024 } });
  await app.register(projectRoutes, { prefix: '/projects' });
  await app.ready();
  return app;
};

describe('project routes', () => {
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

  describe('POST /projects', () => {
    it('should return 201 on successful project creation', async () => {
      const mockProject = {
        id: 'proj-1',
        user_id: 'user-123',
        name: 'Sala de Estar',
        input_type: 'photo',
        style: 'moderno',
        room_type: 'sala',
        status: 'draft',
        is_favorite: false,
      };

      mockProjectService.create.mockResolvedValue(mockProject as never);

      const res = await app.inject({
        method: 'POST',
        url: '/projects',
        headers: authHeaders,
        payload: {
          name: 'Sala de Estar',
          input_type: 'photo',
          style: 'moderno',
          room_type: 'sala',
        },
      });

      expect(res.statusCode).toBe(201);
      const body = JSON.parse(res.body);
      expect(body.data.name).toBe('Sala de Estar');
      expect(body.data.status).toBe('draft');
    });

    it('should return 400 on empty name', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/projects',
        headers: authHeaders,
        payload: {
          name: '',
          input_type: 'photo',
          style: 'moderno',
        },
      });

      expect(res.statusCode).toBe(400);
      const body = JSON.parse(res.body);
      expect(body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 on invalid style', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/projects',
        headers: authHeaders,
        payload: {
          name: 'Test',
          input_type: 'photo',
          style: 'gothic',
        },
      });

      expect(res.statusCode).toBe(400);
      const body = JSON.parse(res.body);
      expect(body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 on invalid input_type', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/projects',
        headers: authHeaders,
        payload: {
          name: 'Test',
          input_type: 'video',
          style: 'moderno',
        },
      });

      expect(res.statusCode).toBe(400);
    });

    it('should return 401 without auth header', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/projects',
        payload: {
          name: 'Test',
          input_type: 'photo',
          style: 'moderno',
        },
      });

      expect(res.statusCode).toBe(401);
    });

    it('should return 400 on name exceeding 100 chars', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/projects',
        headers: authHeaders,
        payload: {
          name: 'A'.repeat(101),
          input_type: 'photo',
          style: 'moderno',
        },
      });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /projects', () => {
    it('should return 200 with paginated projects', async () => {
      const mockResult = {
        data: [
          { id: 'proj-1', name: 'P1' },
          { id: 'proj-2', name: 'P2' },
        ],
        pagination: { cursor: null, has_more: false, total: 2 },
      };

      mockProjectService.list.mockResolvedValue(mockResult as never);

      const res = await app.inject({
        method: 'GET',
        url: '/projects',
        headers: authHeaders,
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body.data).toHaveLength(2);
      expect(body.pagination.total).toBe(2);
    });

    it('should pass query params to service', async () => {
      mockProjectService.list.mockResolvedValue({
        data: [],
        pagination: { cursor: null, has_more: false, total: 0 },
      } as never);

      await app.inject({
        method: 'GET',
        url: '/projects?limit=10&status=draft',
        headers: authHeaders,
      });

      expect(mockProjectService.list).toHaveBeenCalledWith(
        'user-123',
        'valid-token',
        { limit: 10, cursor: undefined, status: 'draft' },
      );
    });

    it('should return 401 without auth', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/projects',
      });

      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /projects/:id', () => {
    it('should return 200 with project details', async () => {
      const mockProject = {
        id: 'proj-1',
        name: 'Sala',
        versions_count: 3,
        has_spatial_input: true,
        latest_version_thumbnail: 'https://img.com/render.jpg',
      };

      mockProjectService.getById.mockResolvedValue(mockProject as never);

      const res = await app.inject({
        method: 'GET',
        url: '/projects/550e8400-e29b-41d4-a716-446655440000',
        headers: authHeaders,
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body.data.versions_count).toBe(3);
    });

    it('should return 404 when project not found', async () => {
      mockProjectService.getById.mockRejectedValue(
        new AppError({ code: 'PROJECT_NOT_FOUND', message: 'Projeto nao encontrado', statusCode: 404 }),
      );

      const res = await app.inject({
        method: 'GET',
        url: '/projects/550e8400-e29b-41d4-a716-446655440000',
        headers: authHeaders,
      });

      expect(res.statusCode).toBe(404);
      const body = JSON.parse(res.body);
      expect(body.error.code).toBe('PROJECT_NOT_FOUND');
    });

    it('should return 400 on invalid UUID', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/projects/not-a-uuid',
        headers: authHeaders,
      });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('PATCH /projects/:id', () => {
    it('should return 200 with updated project', async () => {
      const updatedProject = {
        id: 'proj-1',
        name: 'Nova Sala',
        style: 'industrial',
        is_favorite: true,
      };

      mockProjectService.update.mockResolvedValue(updatedProject as never);

      const res = await app.inject({
        method: 'PATCH',
        url: '/projects/550e8400-e29b-41d4-a716-446655440000',
        headers: authHeaders,
        payload: {
          name: 'Nova Sala',
          style: 'industrial',
          is_favorite: true,
        },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body.data.name).toBe('Nova Sala');
    });

    it('should return 404 when project not found', async () => {
      mockProjectService.update.mockRejectedValue(
        new AppError({ code: 'PROJECT_NOT_FOUND', message: 'Projeto nao encontrado', statusCode: 404 }),
      );

      const res = await app.inject({
        method: 'PATCH',
        url: '/projects/550e8400-e29b-41d4-a716-446655440000',
        headers: authHeaders,
        payload: { name: 'Test' },
      });

      expect(res.statusCode).toBe(404);
    });

    it('should return 400 on invalid style', async () => {
      const res = await app.inject({
        method: 'PATCH',
        url: '/projects/550e8400-e29b-41d4-a716-446655440000',
        headers: authHeaders,
        payload: { style: 'invalid-style' },
      });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('DELETE /projects/:id', () => {
    it('should return 204 on successful deletion', async () => {
      mockProjectService.delete.mockResolvedValue(undefined as never);

      const res = await app.inject({
        method: 'DELETE',
        url: '/projects/550e8400-e29b-41d4-a716-446655440000',
        headers: authHeaders,
      });

      expect(res.statusCode).toBe(204);
    });

    it('should return 404 when project not found', async () => {
      mockProjectService.delete.mockRejectedValue(
        new AppError({ code: 'PROJECT_NOT_FOUND', message: 'Projeto nao encontrado', statusCode: 404 }),
      );

      const res = await app.inject({
        method: 'DELETE',
        url: '/projects/550e8400-e29b-41d4-a716-446655440000',
        headers: authHeaders,
      });

      expect(res.statusCode).toBe(404);
    });

    it('should return 401 without auth', async () => {
      const res = await app.inject({
        method: 'DELETE',
        url: '/projects/550e8400-e29b-41d4-a716-446655440000',
      });

      expect(res.statusCode).toBe(401);
    });
  });

  describe('POST /projects/:id/upload', () => {
    it('should return 201 on successful upload', async () => {
      mockStorageService.verifyProjectOwnership.mockResolvedValue(undefined);
      mockStorageService.validateFile.mockReturnValue(undefined);
      mockStorageService.upload.mockResolvedValue({
        image_url: 'https://storage.supabase.co/signed/url',
        file_size: 1024,
        mime_type: 'image/jpeg',
      });
      mockProjectService.updateImageUrl.mockResolvedValue(undefined as never);

      const boundary = '----FormBoundary';
      const jpegBytes = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0]);
      const payload = Buffer.concat([
        Buffer.from(
          `--${boundary}\r\n` +
          'Content-Disposition: form-data; name="file"; filename="photo.jpg"\r\n' +
          'Content-Type: image/jpeg\r\n\r\n',
        ),
        jpegBytes,
        Buffer.from(`\r\n--${boundary}--\r\n`),
      ]);

      const res = await app.inject({
        method: 'POST',
        url: '/projects/550e8400-e29b-41d4-a716-446655440000/upload',
        headers: {
          ...authHeaders,
          'content-type': `multipart/form-data; boundary=${boundary}`,
        },
        payload,
      });

      expect(res.statusCode).toBe(201);
      const body = JSON.parse(res.body);
      expect(body.data.image_url).toBe('https://storage.supabase.co/signed/url');
      expect(body.data.mime_type).toBe('image/jpeg');
    });

    it('should return 404 when project not found', async () => {
      mockStorageService.verifyProjectOwnership.mockRejectedValue(
        new AppError({ code: 'PROJECT_NOT_FOUND', message: 'Projeto nao encontrado', statusCode: 404 }),
      );

      const boundary = '----FormBoundary';
      const payload = Buffer.from(
        `--${boundary}\r\n` +
        'Content-Disposition: form-data; name="file"; filename="photo.jpg"\r\n' +
        'Content-Type: image/jpeg\r\n\r\n' +
        'fake-data' +
        `\r\n--${boundary}--\r\n`,
      );

      const res = await app.inject({
        method: 'POST',
        url: '/projects/550e8400-e29b-41d4-a716-446655440000/upload',
        headers: {
          ...authHeaders,
          'content-type': `multipart/form-data; boundary=${boundary}`,
        },
        payload,
      });

      expect(res.statusCode).toBe(404);
    });

    it('should return 400 on invalid file type', async () => {
      mockStorageService.verifyProjectOwnership.mockResolvedValue(undefined);
      mockStorageService.validateFile.mockImplementation(() => {
        throw new AppError({
          code: 'INVALID_FILE_TYPE',
          message: 'Apenas arquivos JPEG e PNG sao permitidos',
          statusCode: 400,
        });
      });

      const boundary = '----FormBoundary';
      const payload = Buffer.from(
        `--${boundary}\r\n` +
        'Content-Disposition: form-data; name="file"; filename="doc.pdf"\r\n' +
        'Content-Type: application/pdf\r\n\r\n' +
        'fake-pdf-data' +
        `\r\n--${boundary}--\r\n`,
      );

      const res = await app.inject({
        method: 'POST',
        url: '/projects/550e8400-e29b-41d4-a716-446655440000/upload',
        headers: {
          ...authHeaders,
          'content-type': `multipart/form-data; boundary=${boundary}`,
        },
        payload,
      });

      expect(res.statusCode).toBe(400);
      const body = JSON.parse(res.body);
      expect(body.error.code).toBe('INVALID_FILE_TYPE');
    });

    it('should return 413 on file too large', async () => {
      mockStorageService.verifyProjectOwnership.mockResolvedValue(undefined);
      mockStorageService.validateFile.mockImplementation(() => {
        throw new AppError({
          code: 'FILE_TOO_LARGE',
          message: 'Arquivo deve ter no maximo 20MB',
          statusCode: 413,
        });
      });

      const boundary = '----FormBoundary';
      const payload = Buffer.from(
        `--${boundary}\r\n` +
        'Content-Disposition: form-data; name="file"; filename="big.jpg"\r\n' +
        'Content-Type: image/jpeg\r\n\r\n' +
        'fake-data' +
        `\r\n--${boundary}--\r\n`,
      );

      const res = await app.inject({
        method: 'POST',
        url: '/projects/550e8400-e29b-41d4-a716-446655440000/upload',
        headers: {
          ...authHeaders,
          'content-type': `multipart/form-data; boundary=${boundary}`,
        },
        payload,
      });

      expect(res.statusCode).toBe(413);
      const body = JSON.parse(res.body);
      expect(body.error.code).toBe('FILE_TOO_LARGE');
    });

    it('should return 401 without auth', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/projects/550e8400-e29b-41d4-a716-446655440000/upload',
      });

      expect(res.statusCode).toBe(401);
    });
  });
});
