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

vi.mock('../services/profile.service', () => ({
  profileService: {
    getProfile: vi.fn(),
    updateProfile: vi.fn(),
  },
}));

import { profileRoutes } from '../routes/profile.routes';
import { errorHandler } from '../middleware/error-handler';
import { profileService } from '../services/profile.service';
import { supabaseAdmin } from '../lib/supabase';
import { AppError } from '../lib/errors';

const mockProfileService = vi.mocked(profileService);
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
  await app.register(profileRoutes, { prefix: '/profile' });
  await app.ready();
  return app;
};

describe('profile routes', () => {
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

  describe('GET /profile', () => {
    it('should return 200 with user profile', async () => {
      const mockProfile = {
        id: 'user-123',
        display_name: 'Test User',
        avatar_url: null,
        preferred_style: 'moderno',
        lgpd_consent_at: null,
        training_opt_in: false,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      };

      mockProfileService.getProfile.mockResolvedValue(mockProfile as never);

      const res = await app.inject({
        method: 'GET',
        url: '/profile',
        headers: authHeaders,
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body.data.display_name).toBe('Test User');
      expect(body.data.preferred_style).toBe('moderno');
    });

    it('should return 401 without auth header', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/profile',
      });

      expect(res.statusCode).toBe(401);
    });

    it('should return 401 with invalid token', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid token' },
      } as never);

      const res = await app.inject({
        method: 'GET',
        url: '/profile',
        headers: { authorization: 'Bearer invalid-token' },
      });

      expect(res.statusCode).toBe(401);
    });

    it('should return 404 when profile not found', async () => {
      mockProfileService.getProfile.mockRejectedValue(
        new AppError({ code: 'PROFILE_NOT_FOUND', message: 'Perfil nao encontrado', statusCode: 404 }),
      );

      const res = await app.inject({
        method: 'GET',
        url: '/profile',
        headers: authHeaders,
      });

      expect(res.statusCode).toBe(404);
      const body = JSON.parse(res.body);
      expect(body.error.code).toBe('PROFILE_NOT_FOUND');
    });

    it('should call getProfile with correct userId and token', async () => {
      mockProfileService.getProfile.mockResolvedValue({} as never);

      await app.inject({
        method: 'GET',
        url: '/profile',
        headers: authHeaders,
      });

      expect(mockProfileService.getProfile).toHaveBeenCalledWith('user-123', 'valid-token');
    });
  });

  describe('PATCH /profile', () => {
    it('should return 200 with updated profile', async () => {
      const updatedProfile = {
        id: 'user-123',
        display_name: 'Novo Nome',
        avatar_url: null,
        preferred_style: 'industrial',
        lgpd_consent_at: null,
        training_opt_in: true,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-02T00:00:00Z',
      };

      mockProfileService.updateProfile.mockResolvedValue(updatedProfile as never);

      const res = await app.inject({
        method: 'PATCH',
        url: '/profile',
        headers: authHeaders,
        payload: {
          display_name: 'Novo Nome',
          preferred_style: 'industrial',
          training_opt_in: true,
        },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body.data.display_name).toBe('Novo Nome');
      expect(body.data.preferred_style).toBe('industrial');
    });

    it('should return 400 on invalid preferred_style', async () => {
      const res = await app.inject({
        method: 'PATCH',
        url: '/profile',
        headers: authHeaders,
        payload: {
          preferred_style: 'gothic',
        },
      });

      expect(res.statusCode).toBe(400);
      const body = JSON.parse(res.body);
      expect(body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 on empty display_name', async () => {
      const res = await app.inject({
        method: 'PATCH',
        url: '/profile',
        headers: authHeaders,
        payload: {
          display_name: '',
        },
      });

      expect(res.statusCode).toBe(400);
      const body = JSON.parse(res.body);
      expect(body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 on display_name exceeding 100 chars', async () => {
      const res = await app.inject({
        method: 'PATCH',
        url: '/profile',
        headers: authHeaders,
        payload: {
          display_name: 'A'.repeat(101),
        },
      });

      expect(res.statusCode).toBe(400);
    });

    it('should return 401 without auth header', async () => {
      const res = await app.inject({
        method: 'PATCH',
        url: '/profile',
        payload: {
          display_name: 'Test',
        },
      });

      expect(res.statusCode).toBe(401);
    });

    it('should accept null for nullable fields', async () => {
      mockProfileService.updateProfile.mockResolvedValue({
        id: 'user-123',
        preferred_style: null,
        avatar_url: null,
      } as never);

      const res = await app.inject({
        method: 'PATCH',
        url: '/profile',
        headers: authHeaders,
        payload: {
          preferred_style: null,
          avatar_url: null,
        },
      });

      expect(res.statusCode).toBe(200);
    });

    it('should call updateProfile with correct params', async () => {
      mockProfileService.updateProfile.mockResolvedValue({} as never);

      await app.inject({
        method: 'PATCH',
        url: '/profile',
        headers: authHeaders,
        payload: {
          display_name: 'Test',
          training_opt_in: true,
        },
      });

      expect(mockProfileService.updateProfile).toHaveBeenCalledWith(
        'user-123',
        { display_name: 'Test', training_opt_in: true },
        'valid-token',
      );
    });
  });
});
