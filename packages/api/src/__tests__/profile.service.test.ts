import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../lib/supabase', () => {
  const mockFrom = vi.fn();
  return {
    supabaseAdmin: {},
    createUserClient: vi.fn(() => ({
      from: mockFrom,
    })),
  };
});

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

import { profileService } from '../services/profile.service';
import { createUserClient } from '../lib/supabase';
import { AppError } from '../lib/errors';

const TOKEN = 'test-access-token';
const USER_ID = 'user-123';

function getMockFrom(): ReturnType<typeof vi.fn> {
  const client = (createUserClient as ReturnType<typeof vi.fn>)('token');
  return client.from;
}

function mockChain(result: { data?: unknown; error?: unknown }) {
  const chain: Record<string, unknown> = {};

  chain.select = vi.fn().mockReturnValue(chain);
  chain.update = vi.fn().mockReturnValue(chain);
  chain.eq = vi.fn().mockReturnValue(chain);
  chain.single = vi.fn().mockResolvedValue(result);

  return chain;
}

describe('profileService', () => {
  let mockFrom: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom = getMockFrom();
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      const mockProfile = {
        id: USER_ID,
        display_name: 'Test User',
        avatar_url: null,
        preferred_style: 'moderno',
        lgpd_consent_at: null,
        training_opt_in: false,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      };

      mockFrom.mockReturnValue(mockChain({ data: mockProfile, error: null }));

      const result = await profileService.getProfile(USER_ID, TOKEN);

      expect(result).toEqual(mockProfile);
      expect(mockFrom).toHaveBeenCalledWith('user_profiles');
    });

    it('should throw PROFILE_NOT_FOUND when profile does not exist', async () => {
      mockFrom.mockReturnValue(mockChain({ data: null, error: { message: 'Not found' } }));

      try {
        await profileService.getProfile(USER_ID, TOKEN);
        expect.unreachable();
      } catch (err) {
        const appErr = err as AppError;
        expect(appErr.code).toBe('PROFILE_NOT_FOUND');
        expect(appErr.statusCode).toBe(404);
      }
    });

    it('should throw PROFILE_NOT_FOUND when data is null', async () => {
      mockFrom.mockReturnValue(mockChain({ data: null, error: null }));

      try {
        await profileService.getProfile(USER_ID, TOKEN);
        expect.unreachable();
      } catch (err) {
        const appErr = err as AppError;
        expect(appErr.code).toBe('PROFILE_NOT_FOUND');
        expect(appErr.statusCode).toBe(404);
      }
    });
  });

  describe('updateProfile', () => {
    it('should update profile fields and return updated profile', async () => {
      const updatedProfile = {
        id: USER_ID,
        display_name: 'Novo Nome',
        avatar_url: null,
        preferred_style: 'industrial',
        lgpd_consent_at: null,
        training_opt_in: true,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-02T00:00:00Z',
      };

      mockFrom.mockReturnValue(mockChain({ data: updatedProfile, error: null }));

      const result = await profileService.updateProfile(
        USER_ID,
        { display_name: 'Novo Nome', preferred_style: 'industrial', training_opt_in: true },
        TOKEN,
      );

      expect(result).toEqual(updatedProfile);
    });

    it('should throw PROFILE_UPDATE_FAILED on supabase error', async () => {
      mockFrom.mockReturnValue(mockChain({ data: null, error: { message: 'Update failed' } }));

      try {
        await profileService.updateProfile(USER_ID, { display_name: 'Test' }, TOKEN);
        expect.unreachable();
      } catch (err) {
        const appErr = err as AppError;
        expect(appErr.code).toBe('PROFILE_UPDATE_FAILED');
        expect(appErr.statusCode).toBe(500);
      }
    });

    it('should throw PROFILE_UPDATE_FAILED when data is null', async () => {
      mockFrom.mockReturnValue(mockChain({ data: null, error: null }));

      try {
        await profileService.updateProfile(USER_ID, { display_name: 'Test' }, TOKEN);
        expect.unreachable();
      } catch (err) {
        const appErr = err as AppError;
        expect(appErr.code).toBe('PROFILE_UPDATE_FAILED');
        expect(appErr.statusCode).toBe(500);
      }
    });

    it('should handle nullable fields correctly', async () => {
      const updatedProfile = {
        id: USER_ID,
        display_name: 'Test',
        avatar_url: null,
        preferred_style: null,
        lgpd_consent_at: null,
        training_opt_in: false,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-02T00:00:00Z',
      };

      const chain = mockChain({ data: updatedProfile, error: null });
      mockFrom.mockReturnValue(chain);

      const result = await profileService.updateProfile(
        USER_ID,
        { preferred_style: null, avatar_url: null },
        TOKEN,
      );

      expect(result).toEqual(updatedProfile);
      expect(chain.update).toHaveBeenCalledWith({
        preferred_style: null,
        avatar_url: null,
      });
    });
  });
});
