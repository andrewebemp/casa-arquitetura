import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../lib/supabase', () => ({
  supabaseAdmin: {
    from: vi.fn(),
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

import { requireLgpdConsent } from '../middleware/lgpd-consent.middleware';
import { supabaseAdmin } from '../lib/supabase';
import type { FastifyRequest, FastifyReply } from 'fastify';

const mockFrom = vi.mocked(supabaseAdmin.from);

function createMockReply() {
  const reply = {
    status: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
  };
  return reply as unknown as FastifyReply;
}

function createMockRequest(user: { id: string } | null) {
  return { user } as unknown as FastifyRequest;
}

function mockProfileQuery(data: unknown, error: unknown = null) {
  const chain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data, error }),
  };
  mockFrom.mockReturnValue(chain as never);
  return chain;
}

describe('requireLgpdConsent middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 when no user is present', async () => {
    const request = createMockRequest(null);
    const reply = createMockReply();

    await requireLgpdConsent(request, reply);

    expect(reply.status).toHaveBeenCalledWith(401);
    expect(reply.send).toHaveBeenCalledWith({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Token ausente',
      },
    });
  });

  it('should return 403 when user has no consent', async () => {
    const request = createMockRequest({ id: 'user-123' });
    const reply = createMockReply();

    mockProfileQuery({ lgpd_consent_at: null });

    await requireLgpdConsent(request, reply);

    expect(reply.status).toHaveBeenCalledWith(403);
    expect(reply.send).toHaveBeenCalledWith({
      error: {
        code: 'LGPD_CONSENT_REQUIRED',
        message: 'Consentimento LGPD necessario para processar imagens',
      },
    });
  });

  it('should allow request when user has consent', async () => {
    const request = createMockRequest({ id: 'user-123' });
    const reply = createMockReply();

    mockProfileQuery({ lgpd_consent_at: '2026-01-01T00:00:00Z' });

    await requireLgpdConsent(request, reply);

    expect(reply.status).not.toHaveBeenCalled();
    expect(reply.send).not.toHaveBeenCalled();
  });

  it('should return 403 when profile not found', async () => {
    const request = createMockRequest({ id: 'user-123' });
    const reply = createMockReply();

    mockProfileQuery(null, { message: 'not found' });

    await requireLgpdConsent(request, reply);

    expect(reply.status).toHaveBeenCalledWith(403);
  });
});
