import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../lib/supabase', () => ({
  supabaseAdmin: {
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signInWithIdToken: vi.fn(),
      refreshSession: vi.fn(),
      getUser: vi.fn(),
      admin: {
        signOut: vi.fn(),
      },
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

import { authService } from '../services/auth.service';
import { supabaseAdmin } from '../lib/supabase';
import { AppError } from '../lib/errors';

const mockSignUp = vi.mocked(supabaseAdmin.auth.signUp);
const mockSignIn = vi.mocked(supabaseAdmin.auth.signInWithPassword);
const mockSignInWithIdToken = vi.mocked(supabaseAdmin.auth.signInWithIdToken);
const mockRefreshSession = vi.mocked(supabaseAdmin.auth.refreshSession);
const mockGetUser = vi.mocked(supabaseAdmin.auth.getUser);
const mockAdminSignOut = vi.mocked(supabaseAdmin.auth.admin.signOut);

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('signUpWithEmail', () => {
    it('should return session data on successful signup', async () => {
      const mockData = {
        user: { id: 'user-1', email: 'test@example.com' },
        session: { access_token: 'at', refresh_token: 'rt' },
      };
      mockSignUp.mockResolvedValue({ data: mockData, error: null } as never);

      const result = await authService.signUpWithEmail('test@example.com', 'password123');

      expect(mockSignUp).toHaveBeenCalledWith({ email: 'test@example.com', password: 'password123' });
      expect(result).toEqual(mockData);
    });

    it('should throw USER_ALREADY_EXISTS when email is taken', async () => {
      mockSignUp.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'User already registered', name: 'AuthApiError', status: 400 },
      } as never);

      await expect(authService.signUpWithEmail('dup@example.com', 'password123'))
        .rejects.toThrow(AppError);

      try {
        await authService.signUpWithEmail('dup@example.com', 'password123');
      } catch (err) {
        const appErr = err as AppError;
        expect(appErr.code).toBe('USER_ALREADY_EXISTS');
        expect(appErr.statusCode).toBe(409);
        expect(appErr.message).toBe('Email ja cadastrado');
      }
    });

    it('should throw AUTH_ERROR for other signup failures', async () => {
      mockSignUp.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Some other error', name: 'AuthApiError', status: 400 },
      } as never);

      try {
        await authService.signUpWithEmail('test@example.com', 'pass');
      } catch (err) {
        const appErr = err as AppError;
        expect(appErr.code).toBe('AUTH_ERROR');
        expect(appErr.statusCode).toBe(400);
      }
    });
  });

  describe('signInWithEmail', () => {
    it('should return session data on successful login', async () => {
      const mockData = {
        user: { id: 'user-1', email: 'test@example.com' },
        session: { access_token: 'at', refresh_token: 'rt', expires_in: 3600 },
      };
      mockSignIn.mockResolvedValue({ data: mockData, error: null } as never);

      const result = await authService.signInWithEmail('test@example.com', 'password123');

      expect(mockSignIn).toHaveBeenCalledWith({ email: 'test@example.com', password: 'password123' });
      expect(result).toEqual(mockData);
    });

    it('should throw INVALID_CREDENTIALS on wrong password', async () => {
      mockSignIn.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid login credentials', name: 'AuthApiError', status: 400 },
      } as never);

      try {
        await authService.signInWithEmail('test@example.com', 'wrongpass');
      } catch (err) {
        const appErr = err as AppError;
        expect(appErr.code).toBe('INVALID_CREDENTIALS');
        expect(appErr.statusCode).toBe(401);
        expect(appErr.message).toBe('Email ou senha invalidos');
      }
    });
  });

  describe('signInWithGoogle', () => {
    it('should return session data on valid Google token', async () => {
      const mockData = {
        user: { id: 'user-1', email: 'google@example.com' },
        session: { access_token: 'at', refresh_token: 'rt' },
      };
      mockSignInWithIdToken.mockResolvedValue({ data: mockData, error: null } as never);

      const result = await authService.signInWithGoogle('valid-google-token');

      expect(mockSignInWithIdToken).toHaveBeenCalledWith({
        provider: 'google',
        token: 'valid-google-token',
      });
      expect(result).toEqual(mockData);
    });

    it('should throw INVALID_TOKEN on invalid Google token', async () => {
      mockSignInWithIdToken.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid token', name: 'AuthApiError', status: 401 },
      } as never);

      try {
        await authService.signInWithGoogle('invalid-token');
      } catch (err) {
        const appErr = err as AppError;
        expect(appErr.code).toBe('INVALID_TOKEN');
        expect(appErr.statusCode).toBe(401);
        expect(appErr.message).toBe('Token Google invalido');
      }
    });
  });

  describe('refreshSession', () => {
    it('should return new session on valid refresh token', async () => {
      const mockData = {
        user: { id: 'user-1' },
        session: { access_token: 'new-at', refresh_token: 'new-rt', expires_in: 3600 },
      };
      mockRefreshSession.mockResolvedValue({ data: mockData, error: null } as never);

      const result = await authService.refreshSession('valid-refresh-token');

      expect(mockRefreshSession).toHaveBeenCalledWith({ refresh_token: 'valid-refresh-token' });
      expect(result).toEqual(mockData);
    });

    it('should throw INVALID_TOKEN on invalid refresh token', async () => {
      mockRefreshSession.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid refresh token', name: 'AuthApiError', status: 401 },
      } as never);

      try {
        await authService.refreshSession('bad-refresh');
      } catch (err) {
        const appErr = err as AppError;
        expect(appErr.code).toBe('INVALID_TOKEN');
        expect(appErr.statusCode).toBe(401);
      }
    });
  });

  describe('signOut', () => {
    it('should succeed on valid token', async () => {
      mockAdminSignOut.mockResolvedValue({ error: null } as never);

      await expect(authService.signOut('valid-token')).resolves.toBeUndefined();
      expect(mockAdminSignOut).toHaveBeenCalledWith('valid-token');
    });

    it('should throw AUTH_ERROR on signout failure', async () => {
      mockAdminSignOut.mockResolvedValue({
        error: { message: 'Signout failed', name: 'AuthApiError', status: 500 },
      } as never);

      try {
        await authService.signOut('token');
      } catch (err) {
        const appErr = err as AppError;
        expect(appErr.code).toBe('AUTH_ERROR');
        expect(appErr.statusCode).toBe(500);
      }
    });
  });

  describe('getUser', () => {
    it('should return user profile on valid token', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        user_metadata: { full_name: 'Test User', avatar_url: 'https://img.com/photo.jpg' },
        created_at: '2024-01-01T00:00:00Z',
      };
      mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null } as never);

      const result = await authService.getUser('valid-token');

      expect(result).toEqual({
        id: 'user-1',
        email: 'test@example.com',
        full_name: 'Test User',
        avatar_url: 'https://img.com/photo.jpg',
        created_at: '2024-01-01T00:00:00Z',
      });
    });

    it('should return null for full_name/avatar_url when not in metadata', async () => {
      const mockUser = {
        id: 'user-2',
        email: 'no-meta@example.com',
        user_metadata: {},
        created_at: '2024-01-01T00:00:00Z',
      };
      mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null } as never);

      const result = await authService.getUser('valid-token');

      expect(result.full_name).toBeNull();
      expect(result.avatar_url).toBeNull();
    });

    it('should throw UNAUTHORIZED on invalid token', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid token', name: 'AuthApiError', status: 401 },
      } as never);

      try {
        await authService.getUser('bad-token');
      } catch (err) {
        const appErr = err as AppError;
        expect(appErr.code).toBe('UNAUTHORIZED');
        expect(appErr.statusCode).toBe(401);
      }
    });
  });
});
