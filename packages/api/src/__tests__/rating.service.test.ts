import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../lib/supabase', () => ({
  supabaseAdmin: {
    from: vi.fn(),
    auth: { getUser: vi.fn() },
  },
}));

vi.mock('../lib/redis', () => ({
  getRedisClient: vi.fn(() => ({
    get: vi.fn().mockResolvedValue(null),
    setex: vi.fn().mockResolvedValue('OK'),
    keys: vi.fn().mockResolvedValue([]),
    del: vi.fn().mockResolvedValue(0),
  })),
}));

vi.mock('../config/env', () => ({
  env: {
    SUPABASE_URL: 'https://test.supabase.co',
    SUPABASE_ANON_KEY: 'test-anon-key',
    SUPABASE_SERVICE_ROLE_KEY: 'test-service-key',
    REDIS_URL: 'redis://localhost:6379',
  },
}));

vi.mock('../lib/logger', () => ({
  logger: { error: vi.fn(), info: vi.fn(), debug: vi.fn(), warn: vi.fn() },
}));

import { ratingService } from '../services/rating.service';
import { supabaseAdmin } from '../lib/supabase';

const mockFrom = vi.mocked(supabaseAdmin.from);

function buildChain(finalResult: unknown): Record<string, ReturnType<typeof vi.fn>> {
  const chain: Record<string, ReturnType<typeof vi.fn>> = {};
  const self = () => chain;
  chain.select = vi.fn().mockImplementation(self);
  chain.insert = vi.fn().mockImplementation(self);
  chain.update = vi.fn().mockImplementation(self);
  chain.eq = vi.fn().mockImplementation(self);
  chain.gte = vi.fn().mockImplementation(self);
  chain.lte = vi.fn().mockImplementation(self);
  chain.order = vi.fn().mockImplementation(self);
  chain.limit = vi.fn().mockImplementation(self);
  chain.single = vi.fn().mockResolvedValue(finalResult);
  return chain;
}

describe('ratingService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('upsertRating', () => {
    it('should create a new rating when none exists', async () => {
      const mockRating = { id: 'r1', render_id: 'render-1', user_id: 'user-1', score: 4, tags: ['realistic'] };

      // First call: check existing (returns null)
      const checkChain = buildChain({ data: null, error: { code: 'PGRST116' } });
      // Second call: insert
      const insertChain = buildChain({ data: mockRating, error: null });

      let callCount = 0;
      mockFrom.mockImplementation(() => {
        callCount++;
        return (callCount <= 1 ? checkChain : insertChain) as never;
      });

      const result = await ratingService.upsertRating('render-1', 'user-1', {
        score: 4,
        tags: ['realistic'],
      });

      expect(result).toEqual(mockRating);
    });
  });

  describe('getRating', () => {
    it('should return rating when found', async () => {
      const mockRating = { id: 'r1', score: 4, tags: ['lighting'] };
      const chain = buildChain({ data: mockRating, error: null });
      mockFrom.mockReturnValue(chain as never);

      const result = await ratingService.getRating('render-1', 'user-1');
      expect(result).toEqual(mockRating);
    });

    it('should return null when not found', async () => {
      const chain = buildChain({ data: null, error: null });
      mockFrom.mockReturnValue(chain as never);

      const result = await ratingService.getRating('render-1', 'user-1');
      expect(result).toBeNull();
    });
  });

  describe('extractThemes', () => {
    it('should extract themes from comments', () => {
      const comments = [
        'A qualidade da imagem ficou excelente',
        'Muito facil de usar',
        'Poderia ser mais rapido',
      ];
      const themes = ratingService.extractThemes(comments);
      expect(themes).toContain('qualidade da imagem');
      expect(themes).toContain('facilidade de uso');
      expect(themes).toContain('velocidade');
    });

    it('should return empty array for empty comments', () => {
      expect(ratingService.extractThemes([])).toEqual([]);
    });
  });
});
