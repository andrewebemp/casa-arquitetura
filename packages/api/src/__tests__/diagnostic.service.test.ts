import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../config/env', () => ({
  env: {
    SUPABASE_URL: 'https://test.supabase.co',
    SUPABASE_ANON_KEY: 'test-anon-key',
    SUPABASE_SERVICE_ROLE_KEY: 'test-service-key',
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

vi.mock('../lib/supabase', () => ({
  supabaseAdmin: {
    from: vi.fn(),
    storage: {
      from: vi.fn(),
    },
  },
  createUserClient: vi.fn(),
}));

vi.mock('./diagnostic-analyzer.service', () => ({
  diagnosticAnalyzerService: {
    analyze: vi.fn(),
  },
}));

import { diagnosticService } from '../services/diagnostic.service';
import { supabaseAdmin } from '../lib/supabase';

const mockFrom = vi.mocked(supabaseAdmin.from);

const buildChain = () => {
  const chain: Record<string, ReturnType<typeof vi.fn>> = {};
  chain.select = vi.fn().mockReturnValue(chain);
  chain.eq = vi.fn().mockReturnValue(chain);
  chain.is = vi.fn().mockReturnValue(chain);
  chain.insert = vi.fn().mockReturnValue(chain);
  chain.update = vi.fn().mockReturnValue(chain);
  chain.single = vi.fn();
  return chain;
};

describe('diagnostic service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createDiagnostic', () => {
    it('should create a diagnostic for anonymous user with session_token', async () => {
      const chain = buildChain();
      mockFrom.mockReturnValue(chain as never);
      chain.single.mockResolvedValue({
        data: { id: 'diag-123', session_token: 'session-abc' },
        error: null,
      });

      const result = await diagnosticService.createDiagnostic({});

      expect(result.id).toBe('diag-123');
      expect(result.session_token).toBe('session-abc');
      expect(mockFrom).toHaveBeenCalledWith('diagnostics');
    });

    it('should create a diagnostic for authenticated user without session_token', async () => {
      const chain = buildChain();
      mockFrom.mockReturnValue(chain as never);
      chain.single.mockResolvedValue({
        data: { id: 'diag-456', session_token: null },
        error: null,
      });

      const result = await diagnosticService.createDiagnostic({ userId: 'user-123' });

      expect(result.id).toBe('diag-456');
      expect(result.session_token).toBeNull();
    });

    it('should throw AppError when insert fails', async () => {
      const chain = buildChain();
      mockFrom.mockReturnValue(chain as never);
      chain.single.mockResolvedValue({
        data: null,
        error: { message: 'DB error' },
      });

      await expect(diagnosticService.createDiagnostic({})).rejects.toMatchObject({
        code: 'DIAGNOSTIC_CREATE_FAILED',
        statusCode: 500,
      });
    });
  });

  describe('uploadImage', () => {
    it('should reject unsupported file types', async () => {
      await expect(
        diagnosticService.uploadImage({
          diagnosticId: 'diag-123',
          sessionToken: 'token',
          fileBuffer: Buffer.from('data'),
          mimetype: 'image/gif',
        }),
      ).rejects.toMatchObject({
        code: 'INVALID_FILE_TYPE',
        statusCode: 400,
      });
    });

    it('should reject files over 10MB', async () => {
      const largeBuffer = Buffer.alloc(11 * 1024 * 1024);

      await expect(
        diagnosticService.uploadImage({
          diagnosticId: 'diag-123',
          sessionToken: 'token',
          fileBuffer: largeBuffer,
          mimetype: 'image/jpeg',
        }),
      ).rejects.toMatchObject({
        code: 'FILE_TOO_LARGE',
        statusCode: 400,
      });
    });

    it('should reject when diagnostic not found', async () => {
      const chain = buildChain();
      mockFrom.mockReturnValue(chain as never);
      chain.single.mockResolvedValue({ data: null, error: { message: 'not found' } });

      await expect(
        diagnosticService.uploadImage({
          diagnosticId: 'nonexistent',
          sessionToken: 'token',
          fileBuffer: Buffer.from('data'),
          mimetype: 'image/jpeg',
        }),
      ).rejects.toMatchObject({
        code: 'DIAGNOSTIC_NOT_FOUND',
        statusCode: 404,
      });
    });
  });

  describe('getDiagnostic', () => {
    it('should return diagnostic with CTA for low score', async () => {
      const chain = buildChain();
      mockFrom.mockReturnValue(chain as never);
      chain.single.mockResolvedValue({
        data: {
          id: 'diag-123',
          user_id: null,
          original_image_url: 'https://example.com/img.jpg',
          staged_preview_url: null,
          analysis: {
            issues: [{ category: 'staging', severity: 'high', description: 'test' }],
            estimated_loss_percent: 40,
            estimated_loss_brl: null,
            overall_score: 30,
            recommendations: ['Fix staging'],
          },
          session_token: 'token-abc',
          created_at: '2024-01-01',
        },
        error: null,
      });

      const result = await diagnosticService.getDiagnostic({
        diagnosticId: 'diag-123',
        sessionToken: 'token-abc',
      });

      expect(result.id).toBe('diag-123');
      expect(result.cta).toBeDefined();
      expect(result.cta.plan_recommended).toBe('business');
      expect(result.cta.upgrade_url).toBe('/pricing');
    });

    it('should return CTA with pro for moderate score', async () => {
      const chain = buildChain();
      mockFrom.mockReturnValue(chain as never);
      chain.single.mockResolvedValue({
        data: {
          id: 'diag-456',
          user_id: 'user-1',
          original_image_url: 'https://example.com/img.jpg',
          staged_preview_url: null,
          analysis: {
            issues: [],
            estimated_loss_percent: 15,
            estimated_loss_brl: null,
            overall_score: 55,
            recommendations: [],
          },
          session_token: null,
          created_at: '2024-01-01',
        },
        error: null,
      });

      const result = await diagnosticService.getDiagnostic({
        diagnosticId: 'diag-456',
        userId: 'user-1',
      });

      expect(result.cta.plan_recommended).toBe('pro');
    });

    it('should throw when diagnostic not found', async () => {
      const chain = buildChain();
      mockFrom.mockReturnValue(chain as never);
      chain.single.mockResolvedValue({ data: null, error: { message: 'not found' } });

      await expect(
        diagnosticService.getDiagnostic({
          diagnosticId: 'nonexistent',
          sessionToken: 'token',
        }),
      ).rejects.toMatchObject({
        code: 'DIAGNOSTIC_NOT_FOUND',
        statusCode: 404,
      });
    });
  });

  describe('linkAnonymousDiagnostics', () => {
    it('should link anonymous diagnostics to user', async () => {
      const chain = buildChain();
      mockFrom.mockReturnValue(chain as never);
      chain.select.mockResolvedValue({
        data: [{ id: 'diag-1' }, { id: 'diag-2' }],
        error: null,
      });

      const count = await diagnosticService.linkAnonymousDiagnostics({
        sessionToken: 'session-abc',
        userId: 'user-123',
      });

      expect(count).toBe(2);
    });

    it('should return 0 when no diagnostics to link', async () => {
      const chain = buildChain();
      mockFrom.mockReturnValue(chain as never);
      chain.select.mockResolvedValue({
        data: [],
        error: null,
      });

      const count = await diagnosticService.linkAnonymousDiagnostics({
        sessionToken: 'session-none',
        userId: 'user-123',
      });

      expect(count).toBe(0);
    });
  });
});
