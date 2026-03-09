import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../lib/supabase', () => {
  const mockFrom = vi.fn();
  return {
    supabaseAdmin: {
      storage: {
        from: vi.fn().mockReturnValue({
          list: vi.fn().mockResolvedValue({ data: [] }),
          remove: vi.fn().mockResolvedValue({}),
        }),
      },
    },
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

import { projectService } from '../services/project.service';
import { createUserClient } from '../lib/supabase';
import { AppError } from '../lib/errors';

const TOKEN = 'test-access-token';
const USER_ID = 'user-123';

function getMockFrom(): ReturnType<typeof vi.fn> {
  const client = (createUserClient as ReturnType<typeof vi.fn>)('token');
  return client.from;
}

function mockChain(result: { data?: unknown; error?: unknown; count?: number }) {
  const chain: Record<string, unknown> = {};

  chain.insert = vi.fn().mockReturnValue(chain);
  chain.select = vi.fn().mockReturnValue(chain);
  chain.update = vi.fn().mockReturnValue(chain);
  chain.delete = vi.fn().mockReturnValue(chain);
  chain.eq = vi.fn().mockReturnValue(chain);
  chain.lt = vi.fn().mockReturnValue(chain);
  chain.order = vi.fn().mockReturnValue(chain);
  chain.limit = vi.fn().mockReturnValue(chain);
  chain.single = vi.fn().mockResolvedValue(result);

  // For list queries with count — make chain thenable but still chainable
  if (result.count !== undefined) {
    chain.then = (resolve: (v: unknown) => unknown) =>
      Promise.resolve({
        data: result.data,
        error: result.error,
        count: result.count,
      }).then(resolve);
  }

  return chain;
}

describe('projectService', () => {
  let mockFrom: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom = getMockFrom();
  });

  describe('create', () => {
    it('should create a project and return it', async () => {
      const mockProject = {
        id: 'proj-1',
        user_id: USER_ID,
        name: 'Sala de Estar',
        input_type: 'photo',
        style: 'moderno',
        room_type: 'sala',
        status: 'draft',
        is_favorite: false,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      };

      const chain = mockChain({ data: mockProject, error: null });
      mockFrom.mockReturnValue(chain);

      const result = await projectService.create(
        USER_ID,
        { name: 'Sala de Estar', input_type: 'photo', style: 'moderno', room_type: 'sala' },
        TOKEN,
      );

      expect(result).toEqual(mockProject);
      expect(chain.insert).toHaveBeenCalledWith({
        user_id: USER_ID,
        name: 'Sala de Estar',
        input_type: 'photo',
        style: 'moderno',
        room_type: 'sala',
        status: 'draft',
        is_favorite: false,
      });
    });

    it('should throw PROJECT_CREATE_FAILED on supabase error', async () => {
      const chain = mockChain({ data: null, error: { message: 'Insert failed' } });
      mockFrom.mockReturnValue(chain);

      try {
        await projectService.create(USER_ID, { name: 'Test', input_type: 'photo', style: 'moderno' }, TOKEN);
        expect.unreachable();
      } catch (err) {
        const appErr = err as AppError;
        expect(appErr.code).toBe('PROJECT_CREATE_FAILED');
        expect(appErr.statusCode).toBe(500);
      }
    });
  });

  describe('getById', () => {
    it('should return project with related data', async () => {
      const mockProject = {
        id: 'proj-1',
        user_id: USER_ID,
        name: 'Sala',
        status: 'draft',
      };

      let callCount = 0;
      mockFrom.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return mockChain({ data: mockProject, error: null });
        }
        if (callCount === 2) {
          // versions count - select with count + head
          const chain = mockChain({ data: null, error: null });
          chain.select = vi.fn().mockReturnValue(chain);
          chain.eq = vi.fn().mockReturnValue(chain);
          chain.single = vi.fn().mockResolvedValue({ data: null, count: 3, error: null });
          // Override for head:true
          (chain as Record<string, unknown>).select = vi.fn().mockReturnValue({
            ...chain,
            eq: vi.fn().mockResolvedValue({ data: null, error: null, count: 3 }),
          });
          return chain;
        }
        if (callCount === 3) {
          return mockChain({ data: { render_url: 'https://img.com/render.jpg' }, error: null });
        }
        if (callCount === 4) {
          return mockChain({ data: { id: 'spatial-1' }, error: null });
        }
        return mockChain({ data: null, error: null });
      });

      const result = await projectService.getById('proj-1', USER_ID, TOKEN);

      expect(result.id).toBe('proj-1');
    });

    it('should throw PROJECT_NOT_FOUND when project does not exist', async () => {
      mockFrom.mockReturnValue(mockChain({ data: null, error: { message: 'Not found' } }));

      try {
        await projectService.getById('nonexistent', USER_ID, TOKEN);
        expect.unreachable();
      } catch (err) {
        const appErr = err as AppError;
        expect(appErr.code).toBe('PROJECT_NOT_FOUND');
        expect(appErr.statusCode).toBe(404);
      }
    });
  });

  describe('update', () => {
    it('should update project fields', async () => {
      const updatedProject = {
        id: 'proj-1',
        name: 'Nova Sala',
        style: 'industrial',
        is_favorite: true,
      };

      let callCount = 0;
      mockFrom.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return mockChain({ data: { id: 'proj-1' }, error: null });
        }
        return mockChain({ data: updatedProject, error: null });
      });

      const result = await projectService.update(
        'proj-1',
        USER_ID,
        { name: 'Nova Sala', style: 'industrial', is_favorite: true },
        TOKEN,
      );

      expect(result).toEqual(updatedProject);
    });

    it('should throw PROJECT_NOT_FOUND when project does not belong to user', async () => {
      mockFrom.mockReturnValue(mockChain({ data: null, error: null }));

      try {
        await projectService.update('proj-1', USER_ID, { name: 'Test' }, TOKEN);
        expect.unreachable();
      } catch (err) {
        const appErr = err as AppError;
        expect(appErr.code).toBe('PROJECT_NOT_FOUND');
        expect(appErr.statusCode).toBe(404);
      }
    });
  });

  describe('delete', () => {
    it('should delete project successfully', async () => {
      let callCount = 0;
      mockFrom.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          // existence check
          return mockChain({ data: { id: 'proj-1' }, error: null });
        }
        // delete query - .delete().eq('id').eq('user_id')
        const thenableResult = {
          data: null,
          error: null,
          then: (cb: (v: unknown) => unknown) =>
            Promise.resolve({ data: null, error: null }).then(cb),
        };
        const deleteChain: Record<string, unknown> = {};
        deleteChain.delete = vi.fn().mockReturnValue(deleteChain);
        deleteChain.eq = vi.fn()
          .mockReturnValueOnce(deleteChain) // first .eq('id', ...)
          .mockReturnValue(thenableResult); // second .eq('user_id', ...)
        return deleteChain;
      });

      await expect(projectService.delete('proj-1', USER_ID, TOKEN)).resolves.toBeUndefined();
    });

    it('should throw PROJECT_NOT_FOUND when project does not exist', async () => {
      mockFrom.mockReturnValue(mockChain({ data: null, error: null }));

      try {
        await projectService.delete('nonexistent', USER_ID, TOKEN);
        expect.unreachable();
      } catch (err) {
        const appErr = err as AppError;
        expect(appErr.code).toBe('PROJECT_NOT_FOUND');
        expect(appErr.statusCode).toBe(404);
      }
    });
  });

  describe('list', () => {
    it('should return paginated list of projects', async () => {
      const projects = [
        { id: 'proj-1', name: 'P1', created_at: '2026-01-03' },
        { id: 'proj-2', name: 'P2', created_at: '2026-01-02' },
      ];

      mockFrom.mockReturnValue(
        mockChain({ data: projects, error: null, count: 2 }),
      );

      const result = await projectService.list(USER_ID, TOKEN, { limit: 20 });

      expect(result.data).toHaveLength(2);
      expect(result.pagination.has_more).toBe(false);
      expect(result.pagination.total).toBe(2);
    });

    it('should filter by is_favorite when favorite option is true', async () => {
      const projects = [
        { id: 'proj-1', name: 'Fav Project', is_favorite: true, created_at: '2026-01-03' },
      ];

      const chain = mockChain({ data: projects, error: null, count: 1 });
      mockFrom.mockReturnValue(chain);

      const result = await projectService.list(USER_ID, TOKEN, { limit: 20, favorite: true });

      expect(result.data).toHaveLength(1);
      expect(chain.eq).toHaveBeenCalledWith('is_favorite', true);
    });

    it('should not filter by is_favorite when favorite option is undefined', async () => {
      const projects = [
        { id: 'proj-1', name: 'P1', created_at: '2026-01-03' },
      ];

      const chain = mockChain({ data: projects, error: null, count: 1 });
      mockFrom.mockReturnValue(chain);

      await projectService.list(USER_ID, TOKEN, { limit: 20 });

      // eq should be called for user_id but NOT for is_favorite
      const eqCalls = (chain.eq as ReturnType<typeof vi.fn>).mock.calls;
      const favoriteCall = eqCalls.find((call: unknown[]) => call[0] === 'is_favorite');
      expect(favoriteCall).toBeUndefined();
    });

    it('should indicate has_more when more items exist', async () => {
      const projects = Array.from({ length: 3 }, (_, i) => ({
        id: `proj-${i}`,
        name: `P${i}`,
        created_at: `2026-01-0${3 - i}`,
      }));

      mockFrom.mockReturnValue(
        mockChain({ data: projects, error: null, count: 5 }),
      );

      const result = await projectService.list(USER_ID, TOKEN, { limit: 2 });

      expect(result.data).toHaveLength(2);
      expect(result.pagination.has_more).toBe(true);
      expect(result.pagination.cursor).toBe('proj-1');
    });
  });
});
