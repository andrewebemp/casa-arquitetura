import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockFrom = vi.fn();

vi.mock('../lib/supabase', () => ({
  supabaseAdmin: {},
  createUserClient: vi.fn(() => ({
    from: mockFrom,
  })),
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

import { spatialService } from '../services/spatial.service';
import { AppError } from '../lib/errors';

const TOKEN = 'test-access-token';
const USER_ID = 'user-123';
const PROJECT_ID = 'proj-123';

function mockChain(result: { data?: unknown; error?: unknown }) {
  const chain: Record<string, unknown> = {};
  chain.insert = vi.fn().mockReturnValue(chain);
  chain.select = vi.fn().mockReturnValue(chain);
  chain.update = vi.fn().mockReturnValue(chain);
  chain.delete = vi.fn().mockReturnValue(chain);
  chain.eq = vi.fn().mockReturnValue(chain);
  chain.order = vi.fn().mockReturnValue(chain);
  chain.limit = vi.fn().mockReturnValue(chain);
  chain.single = vi.fn().mockResolvedValue(result);
  return chain;
}

describe('spatialService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('upsert', () => {
    it('should create spatial input when none exists', async () => {
      const mockSpatialInput = {
        id: 'spatial-1',
        project_id: PROJECT_ID,
        dimensions: { width: 4, length: 6, height: 2.8 },
        openings: [],
        items: [],
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      };

      let callCount = 0;
      mockFrom.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          // project ownership check
          return mockChain({ data: { id: PROJECT_ID }, error: null });
        }
        if (callCount === 2) {
          // check existing spatial input
          return mockChain({ data: null, error: { code: 'PGRST116' } });
        }
        // insert
        return mockChain({ data: mockSpatialInput, error: null });
      });

      const result = await spatialService.upsert(
        PROJECT_ID,
        USER_ID,
        { dimensions: { width: 4, length: 6, height: 2.8 } },
        TOKEN,
      );

      expect(result).toEqual(mockSpatialInput);
    });

    it('should update spatial input when one exists', async () => {
      const mockUpdated = {
        id: 'spatial-1',
        project_id: PROJECT_ID,
        dimensions: { width: 5, length: 7, height: 3 },
        openings: [{ type: 'window', wall: 'north', width: 2, height: 1.5 }],
        items: [],
        updated_at: '2026-01-02T00:00:00Z',
      };

      let callCount = 0;
      mockFrom.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return mockChain({ data: { id: PROJECT_ID }, error: null });
        }
        if (callCount === 2) {
          return mockChain({ data: { id: 'spatial-1' }, error: null });
        }
        return mockChain({ data: mockUpdated, error: null });
      });

      const result = await spatialService.upsert(
        PROJECT_ID,
        USER_ID,
        {
          dimensions: { width: 5, length: 7, height: 3 },
          openings: [{ type: 'window', wall: 'north', width: 2, height: 1.5 }],
        },
        TOKEN,
      );

      expect(result).toEqual(mockUpdated);
    });

    it('should throw PROJECT_NOT_FOUND when project does not belong to user', async () => {
      mockFrom.mockReturnValue(mockChain({ data: null, error: null }));

      await expect(
        spatialService.upsert(PROJECT_ID, USER_ID, { dimensions: { width: 4, length: 6, height: 2.8 } }, TOKEN),
      ).rejects.toThrow(AppError);

      try {
        await spatialService.upsert(PROJECT_ID, USER_ID, { dimensions: { width: 4, length: 6, height: 2.8 } }, TOKEN);
      } catch (err) {
        const appErr = err as AppError;
        expect(appErr.code).toBe('PROJECT_NOT_FOUND');
        expect(appErr.statusCode).toBe(404);
      }
    });

    it('should throw on insert failure', async () => {
      let callCount = 0;
      mockFrom.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return mockChain({ data: { id: PROJECT_ID }, error: null });
        }
        if (callCount === 2) {
          return mockChain({ data: null, error: { code: 'PGRST116' } });
        }
        return mockChain({ data: null, error: { message: 'Insert failed' } });
      });

      try {
        await spatialService.upsert(PROJECT_ID, USER_ID, { dimensions: { width: 4, length: 6, height: 2.8 } }, TOKEN);
      } catch (err) {
        const appErr = err as AppError;
        expect(appErr.code).toBe('SPATIAL_INPUT_CREATE_FAILED');
        expect(appErr.statusCode).toBe(500);
      }
    });

    it('should throw on update failure', async () => {
      let callCount = 0;
      mockFrom.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return mockChain({ data: { id: PROJECT_ID }, error: null });
        }
        if (callCount === 2) {
          return mockChain({ data: { id: 'spatial-1' }, error: null });
        }
        return mockChain({ data: null, error: { message: 'Update failed' } });
      });

      try {
        await spatialService.upsert(PROJECT_ID, USER_ID, { dimensions: { width: 4, length: 6, height: 2.8 } }, TOKEN);
      } catch (err) {
        const appErr = err as AppError;
        expect(appErr.code).toBe('SPATIAL_INPUT_UPDATE_FAILED');
        expect(appErr.statusCode).toBe(500);
      }
    });
  });

  describe('get', () => {
    it('should return spatial input for project', async () => {
      const mockSpatialInput = {
        id: 'spatial-1',
        project_id: PROJECT_ID,
        dimensions: { width: 4, length: 6, height: 2.8 },
        openings: [],
        items: [],
        croqui_ascii: null,
        croqui_approved: false,
      };

      let callCount = 0;
      mockFrom.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return mockChain({ data: { id: PROJECT_ID }, error: null });
        }
        return mockChain({ data: mockSpatialInput, error: null });
      });

      const result = await spatialService.get(PROJECT_ID, USER_ID, TOKEN);
      expect(result).toEqual(mockSpatialInput);
    });

    it('should throw SPATIAL_INPUT_NOT_FOUND when no spatial data exists', async () => {
      let callCount = 0;
      mockFrom.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return mockChain({ data: { id: PROJECT_ID }, error: null });
        }
        return mockChain({ data: null, error: { code: 'PGRST116' } });
      });

      try {
        await spatialService.get(PROJECT_ID, USER_ID, TOKEN);
      } catch (err) {
        const appErr = err as AppError;
        expect(appErr.code).toBe('SPATIAL_INPUT_NOT_FOUND');
        expect(appErr.statusCode).toBe(404);
      }
    });

    it('should throw PROJECT_NOT_FOUND when project does not belong to user', async () => {
      mockFrom.mockReturnValue(mockChain({ data: null, error: null }));

      try {
        await spatialService.get(PROJECT_ID, USER_ID, TOKEN);
      } catch (err) {
        const appErr = err as AppError;
        expect(appErr.code).toBe('PROJECT_NOT_FOUND');
        expect(appErr.statusCode).toBe(404);
      }
    });
  });
});
