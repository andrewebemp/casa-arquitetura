import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockFrom = vi.fn();
const mockAdminFrom = vi.fn();

vi.mock('../lib/supabase', () => ({
  supabaseAdmin: { from: (...args: unknown[]) => mockAdminFrom(...args) },
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
    OPENROUTER_API_KEY: 'test-openrouter-key',
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

import { versionService } from '../services/version.service';
import { AppError } from '../lib/errors';

const TOKEN = 'test-access-token';
const USER_ID = 'user-123';
const PROJECT_ID = 'proj-123';
const VERSION_ID = 'ver-123';

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

function mockArrayChain(result: { data?: unknown[]; error?: unknown }) {
  const chain: Record<string, unknown> = {};
  chain.select = vi.fn().mockReturnValue(chain);
  chain.eq = vi.fn().mockReturnValue(chain);
  chain.order = vi.fn().mockReturnValue(chain);
  chain.limit = vi.fn().mockReturnValue(chain);
  chain.then = vi.fn((resolve: (value: unknown) => void) => resolve(result));
  return chain;
}

describe('versionService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('list', () => {
    it('should list all versions ordered by version_number', async () => {
      mockFrom.mockReturnValue(mockChain({ data: { id: PROJECT_ID }, error: null }));

      const versions = [
        { id: 'v1', version_number: 1, image_url: 'img1.jpg' },
        { id: 'v2', version_number: 2, image_url: 'img2.jpg' },
      ];
      mockAdminFrom.mockReturnValue(mockArrayChain({ data: versions, error: null }));

      const result = await versionService.list(PROJECT_ID, USER_ID, TOKEN);
      expect(result).toHaveLength(2);
      expect(result[0].version_number).toBe(1);
    });

    it('should throw 403 when project not owned', async () => {
      mockFrom.mockReturnValue(mockChain({ data: null, error: null }));

      try {
        await versionService.list(PROJECT_ID, USER_ID, TOKEN);
        expect.unreachable('Should have thrown');
      } catch (err) {
        expect((err as AppError).statusCode).toBe(403);
      }
    });
  });

  describe('getById', () => {
    it('should return single version with metadata', async () => {
      mockFrom.mockReturnValue(mockChain({ data: { id: PROJECT_ID }, error: null }));

      const version = {
        id: VERSION_ID,
        project_id: PROJECT_ID,
        version_number: 1,
        image_url: 'img.jpg',
        metadata: { type: 'initial' },
      };
      mockAdminFrom.mockReturnValue(mockChain({ data: version, error: null }));

      const result = await versionService.getById(PROJECT_ID, VERSION_ID, USER_ID, TOKEN);
      expect(result.id).toBe(VERSION_ID);
    });

    it('should throw VERSION_NOT_FOUND for missing version', async () => {
      mockFrom.mockReturnValue(mockChain({ data: { id: PROJECT_ID }, error: null }));
      mockAdminFrom.mockReturnValue(mockChain({ data: null, error: { code: 'PGRST116' } }));

      try {
        await versionService.getById(PROJECT_ID, VERSION_ID, USER_ID, TOKEN);
        expect.unreachable('Should have thrown');
      } catch (err) {
        expect((err as AppError).code).toBe('VERSION_NOT_FOUND');
        expect((err as AppError).statusCode).toBe(404);
      }
    });
  });

  describe('revert', () => {
    it('should create new version copying target version image', async () => {
      mockFrom.mockReturnValue(mockChain({ data: { id: PROJECT_ID }, error: null }));

      const targetVersion = {
        id: VERSION_ID,
        project_id: PROJECT_ID,
        version_number: 2,
        image_url: 'img2.jpg',
        thumbnail_url: 'thumb2.jpg',
        prompt: 'refinement',
        metadata: { type: 'refinement' },
      };

      let adminCallCount = 0;
      mockAdminFrom.mockImplementation(() => {
        adminCallCount++;
        if (adminCallCount === 1) {
          // get target version
          return mockChain({ data: targetVersion, error: null });
        }
        if (adminCallCount === 2) {
          // get latest version number
          return mockArrayChain({ data: [{ version_number: 3 }], error: null });
        }
        // insert new version
        return mockChain({
          data: {
            id: 'v-new',
            project_id: PROJECT_ID,
            version_number: 4,
            image_url: 'img2.jpg',
            refinement_command: 'revert_to_v2',
          },
          error: null,
        });
      });

      const result = await versionService.revert(PROJECT_ID, VERSION_ID, USER_ID, TOKEN);
      expect((result as { version_number: number }).version_number).toBe(4);
      expect((result as { image_url: string }).image_url).toBe('img2.jpg');
      expect((result as { refinement_command: string }).refinement_command).toBe('revert_to_v2');
    });

    it('should throw VERSION_NOT_FOUND when target version missing', async () => {
      mockFrom.mockReturnValue(mockChain({ data: { id: PROJECT_ID }, error: null }));
      mockAdminFrom.mockReturnValue(mockChain({ data: null, error: { code: 'PGRST116' } }));

      try {
        await versionService.revert(PROJECT_ID, VERSION_ID, USER_ID, TOKEN);
        expect.unreachable('Should have thrown');
      } catch (err) {
        expect((err as AppError).code).toBe('VERSION_NOT_FOUND');
        expect((err as AppError).statusCode).toBe(404);
      }
    });

    it('should throw 403 when project not owned', async () => {
      mockFrom.mockReturnValue(mockChain({ data: null, error: null }));

      try {
        await versionService.revert(PROJECT_ID, VERSION_ID, USER_ID, TOKEN);
        expect.unreachable('Should have thrown');
      } catch (err) {
        expect((err as AppError).statusCode).toBe(403);
      }
    });
  });
});
