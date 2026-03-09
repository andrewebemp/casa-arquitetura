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

const mockAnalyzeDepth = vi.fn();
vi.mock('../lib/ai-pipeline.client', () => ({
  aiPipelineClient: {
    analyzeDepth: (...args: unknown[]) => mockAnalyzeDepth(...args),
  },
}));

import { photoAnalysisService } from '../services/photo-analysis.service';
import { AppError } from '../lib/errors';

const TOKEN = 'test-access-token';
const USER_ID = 'user-123';
const PROJECT_ID = 'proj-123';
const IMAGE_URL = 'https://storage.supabase.co/test/room.jpg';

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

describe('photoAnalysisService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('analyze', () => {
    it('should analyze photo, extract spatial data, and generate croqui', async () => {
      // Mock project lookup
      mockFrom.mockReturnValue(
        mockChain({
          data: { id: PROJECT_ID, original_image_url: IMAGE_URL, status: 'draft' },
          error: null,
        }),
      );

      // Mock depth analysis
      mockAnalyzeDepth.mockResolvedValue({
        depth_map_url: 'https://pipeline/depth.png',
        estimated_dimensions: { width_m: 5, length_m: 7, height_m: 2.8 },
        detected_features: [
          { type: 'door', confidence: 0.9, position: { x: 0.5, y: 0 } },
          { type: 'window', confidence: 0.85, position: { x: 0, y: 0.5 } },
        ],
      });

      // Mock Claude spatial interpretation
      const spatialJson = JSON.stringify({
        dimensions: { width: 5, length: 7, height: 2.8 },
        openings: [
          { type: 'door', wall: 'south', width: 0.9, height: 2.1 },
          { type: 'window', wall: 'west', width: 1.2, height: 1.5 },
        ],
        detected_elements: ['door', 'window'],
      });

      const croquiAscii = '+----------+\n|    W     |\n|          |\n+----D-----+';

      let claudeCallCount = 0;
      mockCreate.mockImplementation(() => {
        claudeCallCount++;
        if (claudeCallCount === 1) {
          return Promise.resolve({ content: [{ type: 'text', text: spatialJson }] });
        }
        return Promise.resolve({ content: [{ type: 'text', text: croquiAscii }] });
      });

      // Mock admin DB calls
      let adminCallCount = 0;
      mockAdminFrom.mockImplementation(() => {
        adminCallCount++;
        if (adminCallCount === 1) {
          // Check existing spatial input
          return mockChain({ data: null, error: { code: 'PGRST116' } });
        }
        if (adminCallCount === 2) {
          // Insert spatial input
          return mockChain({ data: { id: 'spatial-1' }, error: null });
        }
        if (adminCallCount === 3) {
          // Update with croqui
          return mockChain({
            data: { id: 'spatial-1', croqui_ascii: croquiAscii, croqui_turn_number: 1 },
            error: null,
          });
        }
        // Update project status
        return mockChain({ data: null, error: null });
      });

      const result = await photoAnalysisService.analyze(PROJECT_ID, USER_ID, TOKEN);
      expect(result.spatial_data.dimensions).toEqual({ width: 5, length: 7, height: 2.8 });
      expect(result.croqui.croqui_ascii).toBe(croquiAscii);
      expect(result.croqui.turn_number).toBe(1);
      expect(result.croqui.approved).toBe(false);
      expect(mockAnalyzeDepth).toHaveBeenCalledWith(IMAGE_URL);
      expect(mockCreate).toHaveBeenCalledTimes(2);
    });

    it('should throw PROJECT_NOT_FOUND when project not found', async () => {
      mockFrom.mockReturnValue(mockChain({ data: null, error: null }));

      try {
        await photoAnalysisService.analyze(PROJECT_ID, USER_ID, TOKEN);
        expect.unreachable('Should have thrown');
      } catch (err) {
        expect((err as AppError).code).toBe('PROJECT_NOT_FOUND');
        expect((err as AppError).statusCode).toBe(404);
      }
    });

    it('should throw PHOTO_NOT_FOUND when no image uploaded', async () => {
      mockFrom.mockReturnValue(
        mockChain({
          data: { id: PROJECT_ID, original_image_url: null, status: 'draft' },
          error: null,
        }),
      );

      try {
        await photoAnalysisService.analyze(PROJECT_ID, USER_ID, TOKEN);
        expect.unreachable('Should have thrown');
      } catch (err) {
        expect((err as AppError).code).toBe('PHOTO_NOT_FOUND');
        expect((err as AppError).statusCode).toBe(400);
      }
    });

    it('should throw DEPTH_ANALYSIS_FAILED when pipeline fails', async () => {
      mockFrom.mockReturnValue(
        mockChain({
          data: { id: PROJECT_ID, original_image_url: IMAGE_URL, status: 'draft' },
          error: null,
        }),
      );

      mockAnalyzeDepth.mockRejectedValue(new Error('Pipeline timeout'));

      try {
        await photoAnalysisService.analyze(PROJECT_ID, USER_ID, TOKEN);
        expect.unreachable('Should have thrown');
      } catch (err) {
        expect((err as AppError).code).toBe('DEPTH_ANALYSIS_FAILED');
        expect((err as AppError).statusCode).toBe(502);
      }
    });
  });
});
