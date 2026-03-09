import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../lib/supabase', () => ({
  supabaseAdmin: {
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

import { consentService } from '../services/consent.service';
import { supabaseAdmin } from '../lib/supabase';
import { AppError } from '../lib/errors';

const mockFrom = vi.mocked(supabaseAdmin.from);

function mockChain(data: unknown, error: unknown = null) {
  const chain = {
    select: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data, error }),
  };
  mockFrom.mockReturnValue(chain as never);
  return chain;
}

describe('consentService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getConsent', () => {
    it('should return consent status for user', async () => {
      const mockData = {
        lgpd_consent_at: '2026-01-01T00:00:00Z',
        lgpd_consent_version: '1.0',
        training_opt_in: false,
      };

      mockChain(mockData);

      const result = await consentService.getConsent('user-123');

      expect(result.has_consent).toBe(true);
      expect(result.lgpd_consent_at).toBe('2026-01-01T00:00:00Z');
      expect(result.lgpd_consent_version).toBe('1.0');
      expect(result.training_opt_in).toBe(false);
    });

    it('should return has_consent false when consent is null', async () => {
      mockChain({
        lgpd_consent_at: null,
        lgpd_consent_version: null,
        training_opt_in: false,
      });

      const result = await consentService.getConsent('user-123');

      expect(result.has_consent).toBe(false);
    });

    it('should throw PROFILE_NOT_FOUND when profile missing', async () => {
      mockChain(null, { message: 'not found' });

      await expect(consentService.getConsent('user-123')).rejects.toThrow(AppError);
      await expect(consentService.getConsent('user-123')).rejects.toMatchObject({
        code: 'PROFILE_NOT_FOUND',
        statusCode: 404,
      });
    });
  });

  describe('grantConsent', () => {
    it('should set consent timestamp and version', async () => {
      const mockData = {
        lgpd_consent_at: '2026-03-09T00:00:00Z',
        lgpd_consent_version: '1.0',
        training_opt_in: false,
      };

      mockChain(mockData);

      const result = await consentService.grantConsent('user-123', '1.0');

      expect(result.has_consent).toBe(true);
      expect(result.lgpd_consent_version).toBe('1.0');
    });

    it('should throw CONSENT_UPDATE_FAILED on error', async () => {
      mockChain(null, { message: 'update failed' });

      await expect(consentService.grantConsent('user-123', '1.0')).rejects.toThrow(AppError);
      await expect(consentService.grantConsent('user-123', '1.0')).rejects.toMatchObject({
        code: 'CONSENT_UPDATE_FAILED',
        statusCode: 500,
      });
    });
  });

  describe('revokeConsent', () => {
    it('should clear consent and training opt-in', async () => {
      mockChain({
        lgpd_consent_at: null,
        lgpd_consent_version: null,
        training_opt_in: false,
      });

      const result = await consentService.revokeConsent('user-123');

      expect(result.has_consent).toBe(false);
      expect(result.lgpd_consent_at).toBeNull();
      expect(result.training_opt_in).toBe(false);
    });
  });

  describe('updateTrainingOptIn', () => {
    it('should update training opt-in to true', async () => {
      mockChain({
        lgpd_consent_at: '2026-01-01T00:00:00Z',
        lgpd_consent_version: '1.0',
        training_opt_in: true,
      });

      const result = await consentService.updateTrainingOptIn('user-123', true);

      expect(result.training_opt_in).toBe(true);
      expect(result.has_consent).toBe(true);
    });

    it('should update training opt-in to false', async () => {
      mockChain({
        lgpd_consent_at: '2026-01-01T00:00:00Z',
        lgpd_consent_version: '1.0',
        training_opt_in: false,
      });

      const result = await consentService.updateTrainingOptIn('user-123', false);

      expect(result.training_opt_in).toBe(false);
    });
  });

  describe('hasConsent', () => {
    it('should return true when consent is granted', async () => {
      mockChain({ lgpd_consent_at: '2026-01-01T00:00:00Z' });

      const result = await consentService.hasConsent('user-123');

      expect(result).toBe(true);
    });

    it('should return false when consent is null', async () => {
      mockChain({ lgpd_consent_at: null });

      const result = await consentService.hasConsent('user-123');

      expect(result).toBe(false);
    });

    it('should return false when profile not found', async () => {
      mockChain(null, { message: 'not found' });

      const result = await consentService.hasConsent('user-123');

      expect(result).toBe(false);
    });
  });
});
