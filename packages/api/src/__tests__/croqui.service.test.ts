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
    ANTHROPIC_API_KEY: 'test-anthropic-key',
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

const mockCreate = vi.fn();
vi.mock('../lib/anthropic', () => ({
  getAnthropicClient: vi.fn(() => ({
    messages: { create: mockCreate },
  })),
}));

import { croquiService } from '../services/croqui.service';
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

describe('croquiService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generate', () => {
    it('should generate croqui from spatial data', async () => {
      const spatialInput = {
        id: 'spatial-1',
        project_id: PROJECT_ID,
        dimensions: { width: 4, length: 6, height: 2.8 },
        openings: [{ type: 'door', wall: 'south', width: 0.9, height: 2.1 }],
        items: [{ name: 'Sofa', width: 2, depth: 0.9, position: 'center-south' }],
        croqui_ascii: null,
        croqui_approved: false,
        croqui_turn_number: 0,
      };

      const generatedCroqui = '+--------+\n|  Sofa  |\n|        |\n+---D----+';

      let userCallCount = 0;
      mockFrom.mockImplementation(() => {
        userCallCount++;
        if (userCallCount === 1) {
          return mockChain({ data: { id: PROJECT_ID, original_image_url: null, status: 'draft' }, error: null });
        }
        return mockChain({ data: spatialInput, error: null });
      });

      mockCreate.mockResolvedValue({
        content: [{ type: 'text', text: generatedCroqui }],
      });

      const updatedSpatial = { ...spatialInput, croqui_ascii: generatedCroqui, croqui_turn_number: 1 };
      mockAdminFrom.mockReturnValue(mockChain({ data: updatedSpatial, error: null }));

      const result = await croquiService.generate(PROJECT_ID, USER_ID, TOKEN);
      expect(result).toEqual(updatedSpatial);
      expect(mockCreate).toHaveBeenCalledOnce();
    });

    it('should throw SPATIAL_INPUT_NOT_FOUND when no spatial data', async () => {
      let userCallCount = 0;
      mockFrom.mockImplementation(() => {
        userCallCount++;
        if (userCallCount === 1) {
          return mockChain({ data: { id: PROJECT_ID, original_image_url: null, status: 'draft' }, error: null });
        }
        return mockChain({ data: null, error: { code: 'PGRST116' } });
      });

      try {
        await croquiService.generate(PROJECT_ID, USER_ID, TOKEN);
        expect.unreachable('Should have thrown');
      } catch (err) {
        expect((err as AppError).code).toBe('SPATIAL_INPUT_NOT_FOUND');
        expect((err as AppError).statusCode).toBe(404);
      }
    });

    it('should throw VALIDATION_ERROR when dimensions are missing', async () => {
      let userCallCount = 0;
      mockFrom.mockImplementation(() => {
        userCallCount++;
        if (userCallCount === 1) {
          return mockChain({ data: { id: PROJECT_ID, original_image_url: null, status: 'draft' }, error: null });
        }
        return mockChain({
          data: { id: 'spatial-1', project_id: PROJECT_ID, dimensions: null, openings: [], items: [] },
          error: null,
        });
      });

      try {
        await croquiService.generate(PROJECT_ID, USER_ID, TOKEN);
        expect.unreachable('Should have thrown');
      } catch (err) {
        expect((err as AppError).code).toBe('VALIDATION_ERROR');
        expect((err as AppError).statusCode).toBe(400);
      }
    });

    it('should throw PROJECT_NOT_FOUND when project does not belong to user', async () => {
      mockFrom.mockReturnValue(mockChain({ data: null, error: null }));

      try {
        await croquiService.generate(PROJECT_ID, USER_ID, TOKEN);
        expect.unreachable('Should have thrown');
      } catch (err) {
        expect((err as AppError).code).toBe('PROJECT_NOT_FOUND');
        expect((err as AppError).statusCode).toBe(404);
      }
    });
  });

  describe('getCroqui', () => {
    it('should return current croqui with turn number', async () => {
      const spatialInput = {
        id: 'spatial-1',
        project_id: PROJECT_ID,
        dimensions: { width: 4, length: 6, height: 2.8 },
        openings: [],
        items: [],
        croqui_ascii: '+------+\n|      |\n+------+',
        croqui_approved: false,
        croqui_turn_number: 2,
      };

      let userCallCount = 0;
      mockFrom.mockImplementation(() => {
        userCallCount++;
        if (userCallCount === 1) {
          return mockChain({ data: { id: PROJECT_ID, original_image_url: null, status: 'draft' }, error: null });
        }
        return mockChain({ data: spatialInput, error: null });
      });

      const result = await croquiService.getCroqui(PROJECT_ID, USER_ID, TOKEN);
      expect(result.croqui_ascii).toBe(spatialInput.croqui_ascii);
      expect(result.turn_number).toBe(2);
      expect(result.approved).toBe(false);
    });

    it('should throw CROQUI_NOT_FOUND when croqui not generated', async () => {
      let userCallCount = 0;
      mockFrom.mockImplementation(() => {
        userCallCount++;
        if (userCallCount === 1) {
          return mockChain({ data: { id: PROJECT_ID, original_image_url: null, status: 'draft' }, error: null });
        }
        return mockChain({
          data: { id: 'spatial-1', croqui_ascii: null, croqui_turn_number: 0 },
          error: null,
        });
      });

      try {
        await croquiService.getCroqui(PROJECT_ID, USER_ID, TOKEN);
        expect.unreachable('Should have thrown');
      } catch (err) {
        expect((err as AppError).code).toBe('CROQUI_NOT_FOUND');
        expect((err as AppError).statusCode).toBe(404);
      }
    });
  });

  describe('adjust', () => {
    it('should adjust croqui and increment turn number', async () => {
      const spatialInput = {
        id: 'spatial-1',
        project_id: PROJECT_ID,
        croqui_ascii: '+------+\n|      |\n+------+',
        croqui_approved: false,
        croqui_turn_number: 1,
      };

      const adjustedCroqui = '+------+\n| Sofa |\n+------+';

      let userCallCount = 0;
      mockFrom.mockImplementation(() => {
        userCallCount++;
        if (userCallCount === 1) {
          return mockChain({ data: { id: PROJECT_ID, original_image_url: null, status: 'draft' }, error: null });
        }
        return mockChain({ data: spatialInput, error: null });
      });

      mockCreate.mockResolvedValue({
        content: [{ type: 'text', text: adjustedCroqui }],
      });

      mockAdminFrom.mockReturnValue(
        mockChain({ data: { ...spatialInput, croqui_ascii: adjustedCroqui, croqui_turn_number: 2 }, error: null }),
      );

      const result = await croquiService.adjust(PROJECT_ID, USER_ID, 'add a sofa in the center', TOKEN);
      expect(result.croqui_ascii).toBe(adjustedCroqui);
      expect(result.turn_number).toBe(2);
      expect(result.approved).toBe(false);
    });

    it('should throw CROQUI_MAX_TURNS_REACHED when on turn 3', async () => {
      let userCallCount = 0;
      mockFrom.mockImplementation(() => {
        userCallCount++;
        if (userCallCount === 1) {
          return mockChain({ data: { id: PROJECT_ID, original_image_url: null, status: 'draft' }, error: null });
        }
        return mockChain({
          data: {
            id: 'spatial-1',
            croqui_ascii: '+------+',
            croqui_approved: false,
            croqui_turn_number: 3,
          },
          error: null,
        });
      });

      try {
        await croquiService.adjust(PROJECT_ID, USER_ID, 'move sofa', TOKEN);
        expect.unreachable('Should have thrown');
      } catch (err) {
        expect((err as AppError).code).toBe('CROQUI_MAX_TURNS_REACHED');
        expect((err as AppError).statusCode).toBe(422);
      }
    });

    it('should throw CROQUI_ALREADY_APPROVED when croqui is approved', async () => {
      let userCallCount = 0;
      mockFrom.mockImplementation(() => {
        userCallCount++;
        if (userCallCount === 1) {
          return mockChain({ data: { id: PROJECT_ID, original_image_url: null, status: 'draft' }, error: null });
        }
        return mockChain({
          data: {
            id: 'spatial-1',
            croqui_ascii: '+------+',
            croqui_approved: true,
            croqui_turn_number: 1,
          },
          error: null,
        });
      });

      try {
        await croquiService.adjust(PROJECT_ID, USER_ID, 'move sofa', TOKEN);
        expect.unreachable('Should have thrown');
      } catch (err) {
        expect((err as AppError).code).toBe('CROQUI_ALREADY_APPROVED');
        expect((err as AppError).statusCode).toBe(409);
      }
    });

    it('should throw CROQUI_NOT_FOUND when no croqui exists', async () => {
      let userCallCount = 0;
      mockFrom.mockImplementation(() => {
        userCallCount++;
        if (userCallCount === 1) {
          return mockChain({ data: { id: PROJECT_ID, original_image_url: null, status: 'draft' }, error: null });
        }
        return mockChain({
          data: { id: 'spatial-1', croqui_ascii: null, croqui_approved: false, croqui_turn_number: 0 },
          error: null,
        });
      });

      try {
        await croquiService.adjust(PROJECT_ID, USER_ID, 'move sofa', TOKEN);
        expect.unreachable('Should have thrown');
      } catch (err) {
        expect((err as AppError).code).toBe('CROQUI_NOT_FOUND');
        expect((err as AppError).statusCode).toBe(400);
      }
    });
  });

  describe('approve', () => {
    it('should approve croqui and create project version', async () => {
      const spatialInput = {
        id: 'spatial-1',
        project_id: PROJECT_ID,
        croqui_ascii: '+------+\n|      |\n+------+',
        croqui_approved: false,
        croqui_turn_number: 2,
      };

      let userCallCount = 0;
      mockFrom.mockImplementation(() => {
        userCallCount++;
        if (userCallCount === 1) {
          return mockChain({ data: { id: PROJECT_ID, original_image_url: null, status: 'draft' }, error: null });
        }
        return mockChain({ data: spatialInput, error: null });
      });

      let adminCallCount = 0;
      mockAdminFrom.mockImplementation(() => {
        adminCallCount++;
        if (adminCallCount === 1) {
          // update croqui_approved
          return mockChain({ data: null, error: null });
        }
        if (adminCallCount === 2) {
          // get versions for next number
          const chain = mockChain({ data: null, error: null });
          chain.single = undefined;
          // Override the chain to return an array result
          const arrayChain: Record<string, unknown> = {};
          arrayChain.select = vi.fn().mockReturnValue(arrayChain);
          arrayChain.eq = vi.fn().mockReturnValue(arrayChain);
          arrayChain.order = vi.fn().mockReturnValue(arrayChain);
          arrayChain.limit = vi.fn().mockResolvedValue({ data: [], error: null });
          return arrayChain;
        }
        if (adminCallCount === 3) {
          // insert project_version
          return mockChain({
            data: { id: 'version-1', project_id: PROJECT_ID, version_number: 1 },
            error: null,
          });
        }
        // update project status
        return mockChain({ data: null, error: null });
      });

      const result = await croquiService.approve(PROJECT_ID, USER_ID, TOKEN);
      expect(result.approved).toBe(true);
      expect(result.croqui_ascii).toBe(spatialInput.croqui_ascii);
      expect(result.version_id).toBe('version-1');
    });

    it('should throw CROQUI_NOT_FOUND when no croqui', async () => {
      let userCallCount = 0;
      mockFrom.mockImplementation(() => {
        userCallCount++;
        if (userCallCount === 1) {
          return mockChain({ data: { id: PROJECT_ID, original_image_url: null, status: 'draft' }, error: null });
        }
        return mockChain({
          data: { id: 'spatial-1', croqui_ascii: null, croqui_approved: false },
          error: null,
        });
      });

      try {
        await croquiService.approve(PROJECT_ID, USER_ID, TOKEN);
        expect.unreachable('Should have thrown');
      } catch (err) {
        expect((err as AppError).code).toBe('CROQUI_NOT_FOUND');
        expect((err as AppError).statusCode).toBe(400);
      }
    });

    it('should throw CROQUI_ALREADY_APPROVED when already approved', async () => {
      let userCallCount = 0;
      mockFrom.mockImplementation(() => {
        userCallCount++;
        if (userCallCount === 1) {
          return mockChain({ data: { id: PROJECT_ID, original_image_url: null, status: 'draft' }, error: null });
        }
        return mockChain({
          data: { id: 'spatial-1', croqui_ascii: '+------+', croqui_approved: true },
          error: null,
        });
      });

      try {
        await croquiService.approve(PROJECT_ID, USER_ID, TOKEN);
        expect.unreachable('Should have thrown');
      } catch (err) {
        expect((err as AppError).code).toBe('CROQUI_ALREADY_APPROVED');
        expect((err as AppError).statusCode).toBe(409);
      }
    });
  });
});
