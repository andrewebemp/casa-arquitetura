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
  },
}));

vi.mock('../services/data-export.service', () => ({
  dataExportService: {
    exportUserData: vi.fn(),
  },
}));

vi.mock('../services/account-deletion.service', () => ({
  accountDeletionService: {
    softDeleteAccount: vi.fn(),
  },
}));

import { consentRoutes } from '../routes/consent.routes';
import { errorHandler } from '../middleware/error-handler';
import { consentService } from '../services/consent.service';
import { dataExportService } from '../services/data-export.service';
import { accountDeletionService } from '../services/account-deletion.service';
import { supabaseAdmin } from '../lib/supabase';

const mockConsentService = vi.mocked(consentService);
const mockDataExportService = vi.mocked(dataExportService);
const mockAccountDeletionService = vi.mocked(accountDeletionService);
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
  await app.register(consentRoutes, { prefix: '/users/me' });
  await app.ready();
  return app;
};

describe('consent routes', () => {
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

  describe('GET /users/me/consent', () => {
    it('should return 200 with consent status', async () => {
      const mockConsent = {
        lgpd_consent_at: '2026-01-01T00:00:00Z',
        lgpd_consent_version: '1.0',
        training_opt_in: false,
        has_consent: true,
      };

      mockConsentService.getConsent.mockResolvedValue(mockConsent);

      const res = await app.inject({
        method: 'GET',
        url: '/users/me/consent',
        headers: authHeaders,
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body.data.has_consent).toBe(true);
    });

    it('should return 401 without auth', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/users/me/consent',
      });

      expect(res.statusCode).toBe(401);
    });
  });

  describe('POST /users/me/consent', () => {
    it('should return 200 when granting consent', async () => {
      const mockConsent = {
        lgpd_consent_at: '2026-03-09T00:00:00Z',
        lgpd_consent_version: '1.0',
        training_opt_in: false,
        has_consent: true,
      };

      mockConsentService.grantConsent.mockResolvedValue(mockConsent);

      const res = await app.inject({
        method: 'POST',
        url: '/users/me/consent',
        headers: authHeaders,
        payload: { consent_version: '1.0' },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body.data.has_consent).toBe(true);
      expect(mockConsentService.grantConsent).toHaveBeenCalledWith('user-123', '1.0');
    });

    it('should return 400 without consent_version', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/users/me/consent',
        headers: authHeaders,
        payload: {},
      });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('DELETE /users/me/consent', () => {
    it('should return 200 when revoking consent', async () => {
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
    });
  });

  describe('PATCH /users/me/training-opt-in', () => {
    it('should return 200 when toggling training', async () => {
      mockConsentService.updateTrainingOptIn.mockResolvedValue({
        lgpd_consent_at: '2026-01-01T00:00:00Z',
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

    it('should return 400 with invalid body', async () => {
      const res = await app.inject({
        method: 'PATCH',
        url: '/users/me/training-opt-in',
        headers: authHeaders,
        payload: { training_opt_in: 'not-a-boolean' },
      });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /users/me/data-export', () => {
    it('should return 200 with exported data', async () => {
      const mockExport = {
        exported_at: '2026-03-09T00:00:00Z',
        user: { profile: { id: 'user-123' } },
        projects: [],
        project_versions: [],
        render_jobs: [],
        chat_messages: [],
        diagnostics: [],
      };

      mockDataExportService.exportUserData.mockResolvedValue(mockExport);

      const res = await app.inject({
        method: 'GET',
        url: '/users/me/data-export',
        headers: authHeaders,
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body.data.exported_at).toBeDefined();
    });
  });

  describe('DELETE /users/me', () => {
    it('should return 200 on soft-delete', async () => {
      mockAccountDeletionService.softDeleteAccount.mockResolvedValue({
        deleted_at: '2026-03-09T00:00:00Z',
        cleanup_scheduled_at: '2026-04-08T00:00:00Z',
        message: 'Conta marcada para exclusao.',
      });

      const res = await app.inject({
        method: 'DELETE',
        url: '/users/me',
        headers: authHeaders,
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body.data.deleted_at).toBeDefined();
    });
  });
});
