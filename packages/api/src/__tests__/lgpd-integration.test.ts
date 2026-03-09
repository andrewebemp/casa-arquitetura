import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';
import Fastify from 'fastify';
import type { FastifyInstance } from 'fastify';

vi.mock('../lib/supabase', () => ({
  supabaseAdmin: {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(),
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
    STRIPE_SECRET_KEY: 'sk_test_123',
    STRIPE_WEBHOOK_SECRET: 'whsec_test',
    STRIPE_PRO_PRICE_ID: 'price_pro',
    STRIPE_BUSINESS_PRICE_ID: 'price_biz',
    ANTHROPIC_API_KEY: 'sk-ant-test',
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

vi.mock('../services/consent.service', () => ({
  consentService: {
    getConsent: vi.fn(),
    grantConsent: vi.fn(),
    revokeConsent: vi.fn(),
    updateTrainingOptIn: vi.fn(),
    hasConsent: vi.fn(),
  },
}));

vi.mock('../services/render.service', () => ({
  renderService: {
    createJob: vi.fn(),
    listJobs: vi.fn(),
    cancelJob: vi.fn(),
  },
}));

import { consentRoutes } from '../routes/consent.routes';
import { errorHandler } from '../middleware/error-handler';
import { consentService } from '../services/consent.service';
import { supabaseAdmin } from '../lib/supabase';

const mockConsentService = vi.mocked(consentService);
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

describe('LGPD integration tests', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockGetUser.mockResolvedValue({
      data: { user: MOCK_USER },
      error: null,
    } as never);

    app = Fastify({ logger: false });
    app.setErrorHandler(errorHandler);
    await app.register(consentRoutes, { prefix: '/users/me' });
    await app.ready();
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  describe('Signup consent flow', () => {
    it('should grant consent and then retrieve it', async () => {
      // Grant consent
      mockConsentService.grantConsent.mockResolvedValue({
        lgpd_consent_at: '2026-03-09T10:00:00Z',
        lgpd_consent_version: '1.0',
        training_opt_in: false,
        has_consent: true,
      });

      const grantRes = await app.inject({
        method: 'POST',
        url: '/users/me/consent',
        headers: authHeaders,
        payload: { consent_version: '1.0' },
      });

      expect(grantRes.statusCode).toBe(200);
      const grantBody = JSON.parse(grantRes.body);
      expect(grantBody.data.has_consent).toBe(true);

      // Get consent
      mockConsentService.getConsent.mockResolvedValue({
        lgpd_consent_at: '2026-03-09T10:00:00Z',
        lgpd_consent_version: '1.0',
        training_opt_in: false,
        has_consent: true,
      });

      const getRes = await app.inject({
        method: 'GET',
        url: '/users/me/consent',
        headers: authHeaders,
      });

      expect(getRes.statusCode).toBe(200);
      const getBody = JSON.parse(getRes.body);
      expect(getBody.data.has_consent).toBe(true);
      expect(getBody.data.lgpd_consent_version).toBe('1.0');
    });

    it('should block signup without consent_version', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/users/me/consent',
        headers: authHeaders,
        payload: {},
      });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('Consent revocation flow', () => {
    it('should revoke consent and return has_consent false', async () => {
      mockConsentService.revokeConsent.mockResolvedValue({
        lgpd_consent_at: null,
        lgpd_consent_version: null,
        training_opt_in: false,
        has_consent: false,
      });

      const res = await app.inject({
        method: 'DELETE',
        url: '/users/me/consent',
        headers: authHeaders,
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body.data.has_consent).toBe(false);
      expect(body.data.training_opt_in).toBe(false);
    });
  });

  describe('Training opt-in toggle', () => {
    it('should default to false (opt-out by default per NFR-09)', async () => {
      mockConsentService.getConsent.mockResolvedValue({
        lgpd_consent_at: '2026-03-09T10:00:00Z',
        lgpd_consent_version: '1.0',
        training_opt_in: false,
        has_consent: true,
      });

      const res = await app.inject({
        method: 'GET',
        url: '/users/me/consent',
        headers: authHeaders,
      });

      const body = JSON.parse(res.body);
      expect(body.data.training_opt_in).toBe(false);
    });

    it('should toggle training opt-in to true', async () => {
      mockConsentService.updateTrainingOptIn.mockResolvedValue({
        lgpd_consent_at: '2026-03-09T10:00:00Z',
        lgpd_consent_version: '1.0',
        training_opt_in: true,
        has_consent: true,
      });

      const res = await app.inject({
        method: 'PATCH',
        url: '/users/me/training-opt-in',
        headers: authHeaders,
        payload: { training_opt_in: true },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body.data.training_opt_in).toBe(true);
    });
  });
});
