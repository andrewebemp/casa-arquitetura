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

import { dataExportService } from '../services/data-export.service';
import { supabaseAdmin } from '../lib/supabase';
import { AppError } from '../lib/errors';

const mockFrom = vi.mocked(supabaseAdmin.from);

describe('dataExportService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('exportUserData', () => {
    it('should aggregate all user data', async () => {
      const profileData = {
        id: 'user-123',
        display_name: 'Test User',
        lgpd_consent_at: '2026-01-01T00:00:00Z',
      };

      const projectsData = [
        { id: 'proj-1', name: 'Project 1', user_id: 'user-123' },
      ];

      // Mock multiple from() calls
      let callCount = 0;
      mockFrom.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          // user_profiles
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: profileData, error: null }),
              }),
            }),
          } as never;
        }
        if (callCount === 2) {
          // projects
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ data: projectsData, error: null }),
            }),
          } as never;
        }
        if (callCount === 3) {
          // subscriptions
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ data: [], error: null }),
            }),
          } as never;
        }
        if (callCount === 4) {
          // diagnostics
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ data: [], error: null }),
            }),
          } as never;
        }
        // project_versions, render_jobs, chat_messages
        return {
          select: vi.fn().mockReturnValue({
            in: vi.fn().mockResolvedValue({ data: [], error: null }),
          }),
        } as never;
      });

      const result = await dataExportService.exportUserData('user-123');

      expect(result.exported_at).toBeDefined();
      expect(result.user.profile).toEqual(profileData);
      expect(result.projects).toEqual(projectsData);
    });

    it('should throw DATA_EXPORT_FAILED when profile query fails', async () => {
      mockFrom.mockImplementation(() => {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: null, error: { message: 'failed' } }),
            }),
          }),
        } as never;
      });

      await expect(dataExportService.exportUserData('user-123')).rejects.toThrow(AppError);
      await expect(dataExportService.exportUserData('user-123')).rejects.toMatchObject({
        code: 'DATA_EXPORT_FAILED',
      });
    });
  });
});
