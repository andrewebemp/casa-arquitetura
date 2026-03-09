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

import { quotaService } from '../services/quota.service';
import { supabaseAdmin } from '../lib/supabase';
import { AppError } from '../lib/errors';

const mockFrom = vi.mocked(supabaseAdmin.from);

// Build a fluent chain where every method returns the chain itself,
// except the terminal call which resolves with the given result.
const buildChain = () => {
  const chain: Record<string, ReturnType<typeof vi.fn>> = {};
  chain.select = vi.fn().mockReturnValue(chain);
  chain.eq = vi.fn().mockReturnValue(chain);
  chain.gte = vi.fn().mockReturnValue(chain);
  chain.in = vi.fn().mockReturnValue(chain);
  chain.single = vi.fn();
  return chain;
};

describe('quota service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getUserTier', () => {
    it('should return subscription tier for user with active subscription', async () => {
      const chain = buildChain();
      chain.single.mockResolvedValue({ data: { tier: 'pro' }, error: null });
      mockFrom.mockReturnValue(chain as never);

      const tier = await quotaService.getUserTier('user-123');
      expect(tier).toBe('pro');
    });

    it('should return free when no active subscription found', async () => {
      const chain = buildChain();
      chain.single.mockResolvedValue({ data: null, error: { message: 'not found' } });
      mockFrom.mockReturnValue(chain as never);

      const tier = await quotaService.getUserTier('user-123');
      expect(tier).toBe('free');
    });
  });

  describe('getMonthlyRenderCount', () => {
    it('should return count of render jobs for user projects', async () => {
      // Projects query: from('projects').select('id').eq('user_id', ...)
      const projChain = buildChain();
      projChain.eq.mockResolvedValue({
        data: [{ id: 'proj-1' }, { id: 'proj-2' }],
        error: null,
      });

      // Render jobs query: from('render_jobs').select(...).in(...).gte(...).in(...)
      // The final `.in` is the terminal
      const renderChain = buildChain();
      // .in() -> chain, .gte() -> chain, .in() -> result
      // We need the 2nd .in call to return the result
      let inCallCount = 0;
      renderChain.in.mockImplementation(() => {
        inCallCount++;
        if (inCallCount >= 2) {
          return Promise.resolve({ count: 2, error: null });
        }
        return renderChain;
      });

      mockFrom.mockImplementation((table: string) => {
        if (table === 'projects') return projChain as never;
        return renderChain as never;
      });

      const count = await quotaService.getMonthlyRenderCount('user-123');
      expect(count).toBe(2);
    });

    it('should return 0 when user has no projects', async () => {
      const projChain = buildChain();
      projChain.eq.mockResolvedValue({ data: [], error: null });

      mockFrom.mockReturnValue(projChain as never);

      const count = await quotaService.getMonthlyRenderCount('user-123');
      expect(count).toBe(0);
    });
  });

  describe('checkQuota', () => {
    const setupMocks = (tier: string, renderCount: number) => {
      const subChain = buildChain();
      subChain.single.mockResolvedValue({ data: { tier }, error: null });

      const projChain = buildChain();
      projChain.eq.mockResolvedValue({
        data: [{ id: 'proj-1' }],
        error: null,
      });

      const renderChain = buildChain();
      let inCallCount = 0;
      renderChain.in.mockImplementation(() => {
        inCallCount++;
        if (inCallCount >= 2) {
          return Promise.resolve({ count: renderCount, error: null });
        }
        return renderChain;
      });

      mockFrom.mockImplementation((table: string) => {
        if (table === 'subscriptions') return subChain as never;
        if (table === 'projects') return projChain as never;
        return renderChain as never;
      });
    };

    it('should return allowed=true when within limits', async () => {
      setupMocks('free', 1);

      const result = await quotaService.checkQuota('user-123');
      expect(result.allowed).toBe(true);
      expect(result.renders_used).toBe(1);
      expect(result.renders_limit).toBe(3);
      expect(result.remaining).toBe(2);
      expect(result.tier).toBe('free');
    });

    it('should return allowed=false when quota exceeded', async () => {
      setupMocks('free', 3);

      const result = await quotaService.checkQuota('user-123');
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });
  });

  describe('enforceQuota', () => {
    const setupMocks = (tier: string, renderCount: number) => {
      const subChain = buildChain();
      subChain.single.mockResolvedValue({ data: { tier }, error: null });

      const projChain = buildChain();
      projChain.eq.mockResolvedValue({
        data: [{ id: 'proj-1' }],
        error: null,
      });

      const renderChain = buildChain();
      let inCallCount = 0;
      renderChain.in.mockImplementation(() => {
        inCallCount++;
        if (inCallCount >= 2) {
          return Promise.resolve({ count: renderCount, error: null });
        }
        return renderChain;
      });

      mockFrom.mockImplementation((table: string) => {
        if (table === 'subscriptions') return subChain as never;
        if (table === 'projects') return projChain as never;
        return renderChain as never;
      });
    };

    it('should throw QUOTA_EXCEEDED with 429 when quota exceeded', async () => {
      setupMocks('free', 3);

      try {
        await quotaService.enforceQuota('user-123');
        expect.fail('Should have thrown');
      } catch (err) {
        expect(err).toBeInstanceOf(AppError);
        const appError = err as AppError;
        expect(appError.code).toBe('QUOTA_EXCEEDED');
        expect(appError.statusCode).toBe(429);
      }
    });

    it('should return quota when within limits', async () => {
      setupMocks('pro', 10);

      const result = await quotaService.enforceQuota('user-123');
      expect(result.allowed).toBe(true);
      expect(result.tier).toBe('pro');
      expect(result.remaining).toBe(90);
    });
  });
});
