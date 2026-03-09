import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';
import Fastify from 'fastify';
import type { FastifyInstance } from 'fastify';

vi.mock('../lib/supabase', () => ({
  supabaseAdmin: {
    auth: {
      getUser: vi.fn(),
    },
  },
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

vi.mock('../services/auth.service', () => ({
  authService: {
    signUpWithEmail: vi.fn(),
    signInWithEmail: vi.fn(),
    signInWithGoogle: vi.fn(),
    refreshSession: vi.fn(),
    signOut: vi.fn(),
    getUser: vi.fn(),
  },
}));

import { authRoutes } from '../routes/auth.routes';
import { errorHandler } from '../middleware/error-handler';
import { authService } from '../services/auth.service';
import { supabaseAdmin } from '../lib/supabase';
import { AppError } from '../lib/errors';

const mockAuthService = vi.mocked(authService);
const mockGetUser = vi.mocked(supabaseAdmin.auth.getUser);

const buildApp = async (): Promise<FastifyInstance> => {
  const app = Fastify({ logger: false });
  app.setErrorHandler(errorHandler);
  await app.register(authRoutes, { prefix: '/auth' });
  await app.ready();
  return app;
};

describe('auth routes', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    vi.clearAllMocks();
    app = await buildApp();
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  describe('POST /auth/signup', () => {
    it('should return 201 with session on successful signup', async () => {
      mockAuthService.signUpWithEmail.mockResolvedValue({
        user: { id: 'user-1', email: 'test@example.com' },
        session: { access_token: 'at', refresh_token: 'rt' },
      } as never);

      const res = await app.inject({
        method: 'POST',
        url: '/auth/signup',
        payload: { email: 'test@example.com', password: '12345678' },
      });

      expect(res.statusCode).toBe(201);
      const body = JSON.parse(res.body);
      expect(body.access_token).toBe('at');
      expect(body.refresh_token).toBe('rt');
    });

    it('should return 409 when email already exists', async () => {
      mockAuthService.signUpWithEmail.mockRejectedValue(
        new AppError({ code: 'USER_ALREADY_EXISTS', message: 'Email ja cadastrado', statusCode: 409 })
      );

      const res = await app.inject({
        method: 'POST',
        url: '/auth/signup',
        payload: { email: 'dup@example.com', password: '12345678' },
      });

      expect(res.statusCode).toBe(409);
      const body = JSON.parse(res.body);
      expect(body.error.code).toBe('USER_ALREADY_EXISTS');
      expect(body.error.message).toBe('Email ja cadastrado');
    });

    it('should return 400 on invalid email', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/auth/signup',
        payload: { email: 'bad-email', password: '12345678' },
      });

      expect(res.statusCode).toBe(400);
      const body = JSON.parse(res.body);
      expect(body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 on short password', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/auth/signup',
        payload: { email: 'test@example.com', password: '1234567' },
      });

      expect(res.statusCode).toBe(400);
      const body = JSON.parse(res.body);
      expect(body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /auth/login', () => {
    it('should return 200 with session on successful login', async () => {
      mockAuthService.signInWithEmail.mockResolvedValue({
        user: { id: 'user-1', email: 'test@example.com' },
        session: { access_token: 'at', refresh_token: 'rt', expires_in: 3600 },
      } as never);

      const res = await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: { email: 'test@example.com', password: 'password123' },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body.access_token).toBe('at');
      expect(body.refresh_token).toBe('rt');
      expect(body.expires_in).toBe(3600);
    });

    it('should return 401 on invalid credentials', async () => {
      mockAuthService.signInWithEmail.mockRejectedValue(
        new AppError({ code: 'INVALID_CREDENTIALS', message: 'Email ou senha invalidos', statusCode: 401 })
      );

      const res = await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: { email: 'test@example.com', password: 'wrongpass' },
      });

      expect(res.statusCode).toBe(401);
      const body = JSON.parse(res.body);
      expect(body.error.code).toBe('INVALID_CREDENTIALS');
    });

    it('should return 400 on missing password', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: { email: 'test@example.com' },
      });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('POST /auth/google', () => {
    it('should return 200 with session on valid Google token', async () => {
      mockAuthService.signInWithGoogle.mockResolvedValue({
        user: { id: 'user-1', email: 'google@example.com' },
        session: { access_token: 'at', refresh_token: 'rt' },
      } as never);

      const res = await app.inject({
        method: 'POST',
        url: '/auth/google',
        payload: { id_token: 'valid-google-token' },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body.access_token).toBe('at');
    });

    it('should return 401 on invalid Google token', async () => {
      mockAuthService.signInWithGoogle.mockRejectedValue(
        new AppError({ code: 'INVALID_TOKEN', message: 'Token Google invalido', statusCode: 401 })
      );

      const res = await app.inject({
        method: 'POST',
        url: '/auth/google',
        payload: { id_token: 'bad-token' },
      });

      expect(res.statusCode).toBe(401);
      const body = JSON.parse(res.body);
      expect(body.error.code).toBe('INVALID_TOKEN');
      expect(body.error.message).toBe('Token Google invalido');
    });

    it('should return 400 on missing id_token', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/auth/google',
        payload: {},
      });

      expect(res.statusCode).toBe(400);
      const body = JSON.parse(res.body);
      expect(body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /auth/me', () => {
    it('should return 200 with user profile when authenticated', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
        created_at: '2024-01-01',
      };

      mockGetUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      } as never);

      mockAuthService.getUser.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        full_name: null,
        avatar_url: null,
        created_at: '2024-01-01',
      });

      const res = await app.inject({
        method: 'GET',
        url: '/auth/me',
        headers: { authorization: 'Bearer valid-token' },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body.id).toBe('user-1');
      expect(body.email).toBe('test@example.com');
    });

    it('should return 401 without Authorization header', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/auth/me',
      });

      expect(res.statusCode).toBe(401);
      const body = JSON.parse(res.body);
      expect(body.error.code).toBe('UNAUTHORIZED');
    });

    it('should return 401 with expired token', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Token expired', name: 'AuthApiError', status: 401 },
      } as never);

      const res = await app.inject({
        method: 'GET',
        url: '/auth/me',
        headers: { authorization: 'Bearer expired-token' },
      });

      expect(res.statusCode).toBe(401);
    });
  });

  describe('POST /auth/refresh', () => {
    it('should return 200 with new session on valid refresh token', async () => {
      mockAuthService.refreshSession.mockResolvedValue({
        user: { id: 'user-1' },
        session: { access_token: 'new-at', refresh_token: 'new-rt', expires_in: 3600 },
      } as never);

      const res = await app.inject({
        method: 'POST',
        url: '/auth/refresh',
        payload: { refresh_token: 'valid-refresh' },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body.access_token).toBe('new-at');
      expect(body.refresh_token).toBe('new-rt');
    });

    it('should return 400 on missing refresh_token', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/auth/refresh',
        payload: {},
      });

      expect(res.statusCode).toBe(400);
      const body = JSON.parse(res.body);
      expect(body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /auth/logout', () => {
    it('should return 200 on successful logout', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
        created_at: '2024-01-01',
      };

      mockGetUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      } as never);

      mockAuthService.signOut.mockResolvedValue(undefined);

      const res = await app.inject({
        method: 'POST',
        url: '/auth/logout',
        headers: { authorization: 'Bearer valid-token' },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body.message).toBe('Sessao encerrada com sucesso');
    });

    it('should return 401 without Authorization header', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/auth/logout',
      });

      expect(res.statusCode).toBe(401);
    });
  });
});
