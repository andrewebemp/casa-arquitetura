import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FastifyReply, FastifyRequest } from 'fastify';

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

import { authMiddleware } from '../middleware/auth.middleware';
import { supabaseAdmin } from '../lib/supabase';

const mockGetUser = vi.mocked(supabaseAdmin.auth.getUser);

const createMockRequest = (authHeader?: string): FastifyRequest => {
  return {
    headers: {
      authorization: authHeader,
    },
  } as unknown as FastifyRequest;
};

const createMockReply = (): FastifyReply => {
  const reply = {
    status: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
  } as unknown as FastifyReply;
  return reply;
};

describe('authMiddleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 when Authorization header is missing', async () => {
    const request = createMockRequest(undefined);
    const reply = createMockReply();

    await authMiddleware(request, reply);

    expect(reply.status).toHaveBeenCalledWith(401);
    expect(reply.send).toHaveBeenCalledWith({
      error: { code: 'UNAUTHORIZED', message: 'Token ausente' },
    });
  });

  it('should return 401 when Authorization header does not start with Bearer', async () => {
    const request = createMockRequest('Basic abc123');
    const reply = createMockReply();

    await authMiddleware(request, reply);

    expect(reply.status).toHaveBeenCalledWith(401);
    expect(reply.send).toHaveBeenCalledWith({
      error: { code: 'UNAUTHORIZED', message: 'Token ausente' },
    });
  });

  it('should return 401 when token is invalid', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Invalid token', name: 'AuthApiError', status: 401 },
    } as ReturnType<typeof supabaseAdmin.auth.getUser> extends Promise<infer R> ? R : never);

    const request = createMockRequest('Bearer invalid-token');
    const reply = createMockReply();

    await authMiddleware(request, reply);

    expect(mockGetUser).toHaveBeenCalledWith('invalid-token');
    expect(reply.status).toHaveBeenCalledWith(401);
    expect(reply.send).toHaveBeenCalledWith({
      error: { code: 'UNAUTHORIZED', message: 'Token invalido' },
    });
  });

  it('should attach user to request when token is valid', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated',
      created_at: '2024-01-01',
    };

    mockGetUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    } as ReturnType<typeof supabaseAdmin.auth.getUser> extends Promise<infer R> ? R : never);

    const request = createMockRequest('Bearer valid-token');
    const reply = createMockReply();

    await authMiddleware(request, reply);

    expect(mockGetUser).toHaveBeenCalledWith('valid-token');
    expect(request.user).toEqual(mockUser);
    expect(reply.status).not.toHaveBeenCalled();
  });
});
