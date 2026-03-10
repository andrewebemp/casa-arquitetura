import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockFrom = vi.fn();
const mockAdminFrom = vi.fn();
const mockGetByUserId = vi.fn();

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
    STRIPE_SECRET_KEY: 'sk_test_xxx',
    STRIPE_WEBHOOK_SECRET: 'whsec_xxx',
    STRIPE_PRO_PRICE_ID: 'price_pro',
    STRIPE_BUSINESS_PRICE_ID: 'price_biz',
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

vi.mock('../lib/stripe', () => ({
  stripe: {},
}));

vi.mock('../services/subscription.service', () => ({
  subscriptionService: {
    getByUserId: (...args: unknown[]) => mockGetByUserId(...args),
  },
}));

vi.mock('../services/image-cdn.service', () => ({
  imageCdnService: {
    resolveImageUrl: vi.fn((url: string | null | undefined) => Promise.resolve(url ?? null)),
  },
}));

import { shareLinkService } from '../services/share-link.service';
import { AppError } from '../lib/errors';

const TOKEN = 'test-access-token';
const USER_ID = 'user-123';
const PROJECT_ID = 'proj-123';
const VERSION_ID = 'ver-123';
const SHARE_TOKEN = 'abcdef1234567890abcdef1234567890';

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

describe('shareLinkService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getSliderData', () => {
    it('should return slider data for latest version', async () => {
      const project = {
        id: PROJECT_ID,
        name: 'Sala Moderna',
        style: 'moderno',
        original_image_url: 'original.jpg',
      };
      mockFrom.mockReturnValue(mockChain({ data: project, error: null }));

      const version = {
        id: VERSION_ID,
        project_id: PROJECT_ID,
        version_number: 1,
        image_url: 'rendered.jpg',
        render_url: 'render.jpg',
        created_at: '2026-03-01T00:00:00Z',
      };
      mockAdminFrom.mockReturnValue(mockArrayChain({ data: [version], error: null }));

      const result = await shareLinkService.getSliderData(PROJECT_ID, USER_ID, TOKEN);

      expect(result.original_url).toBe('original.jpg');
      expect(result.rendered_url).toBe('render.jpg');
      expect(result.project_name).toBe('Sala Moderna');
      expect(result.style).toBe('moderno');
      expect(result.version_id).toBe(VERSION_ID);
    });

    it('should return 404 when no versions exist', async () => {
      mockFrom.mockReturnValue(mockChain({ data: { id: PROJECT_ID }, error: null }));
      mockAdminFrom.mockReturnValue(mockArrayChain({ data: [], error: null }));

      try {
        await shareLinkService.getSliderData(PROJECT_ID, USER_ID, TOKEN);
        expect.unreachable('Should have thrown');
      } catch (err) {
        expect((err as AppError).statusCode).toBe(404);
        expect((err as AppError).code).toBe('NO_RENDERED_VERSION');
      }
    });

    it('should return 403 when project not owned', async () => {
      mockFrom.mockReturnValue(mockChain({ data: null, error: null }));

      try {
        await shareLinkService.getSliderData(PROJECT_ID, USER_ID, TOKEN);
        expect.unreachable('Should have thrown');
      } catch (err) {
        expect((err as AppError).statusCode).toBe(403);
      }
    });

    it('should return specific version when version_id provided', async () => {
      const project = {
        id: PROJECT_ID,
        name: 'Test',
        style: 'industrial',
        original_image_url: 'orig.jpg',
      };
      mockFrom.mockReturnValue(mockChain({ data: project, error: null }));

      const version = {
        id: VERSION_ID,
        project_id: PROJECT_ID,
        version_number: 2,
        image_url: 'v2.jpg',
        render_url: null,
        created_at: '2026-03-02T00:00:00Z',
      };
      mockAdminFrom.mockReturnValue(mockChain({ data: version, error: null }));

      const result = await shareLinkService.getSliderData(PROJECT_ID, USER_ID, TOKEN, VERSION_ID);

      expect(result.rendered_url).toBe('v2.jpg');
      expect(result.version_id).toBe(VERSION_ID);
    });
  });

  describe('createShareLink', () => {
    it('should create share link with watermark for free tier', async () => {
      mockFrom.mockReturnValue(mockChain({ data: { id: PROJECT_ID }, error: null }));

      const version = { id: VERSION_ID, version_number: 1 };
      const shareLink = {
        id: 'share-1',
        share_token: SHARE_TOKEN,
        expires_at: null,
        project_id: PROJECT_ID,
        version_id: VERSION_ID,
        include_watermark: true,
        view_count: 0,
        created_at: '2026-03-01T00:00:00Z',
      };

      let adminCallCount = 0;
      mockAdminFrom.mockImplementation(() => {
        adminCallCount++;
        if (adminCallCount === 1) {
          return mockArrayChain({ data: [version], error: null });
        }
        return mockChain({ data: shareLink, error: null });
      });

      mockGetByUserId.mockResolvedValue({ tier: 'free' });

      const result = await shareLinkService.createShareLink(PROJECT_ID, USER_ID, TOKEN);

      expect(result.share_id).toBe('share-1');
      expect(result.share_token).toBe(SHARE_TOKEN);
      expect(result.share_url).toBe(`/share/${SHARE_TOKEN}`);
      expect(result.expires_at).toBeNull();
    });

    it('should create share link without watermark for pro tier', async () => {
      mockFrom.mockReturnValue(mockChain({ data: { id: PROJECT_ID }, error: null }));

      const version = { id: VERSION_ID, version_number: 1 };
      const shareLink = {
        id: 'share-2',
        share_token: SHARE_TOKEN,
        expires_at: null,
        project_id: PROJECT_ID,
        version_id: VERSION_ID,
        include_watermark: false,
        view_count: 0,
        created_at: '2026-03-01T00:00:00Z',
      };

      let adminCallCount = 0;
      mockAdminFrom.mockImplementation(() => {
        adminCallCount++;
        if (adminCallCount === 1) {
          return mockArrayChain({ data: [version], error: null });
        }
        return mockChain({ data: shareLink, error: null });
      });

      mockGetByUserId.mockResolvedValue({ tier: 'pro' });

      const result = await shareLinkService.createShareLink(PROJECT_ID, USER_ID, TOKEN);

      expect(result.share_id).toBe('share-2');
    });

    it('should return 400 when no rendered version', async () => {
      mockFrom.mockReturnValue(mockChain({ data: { id: PROJECT_ID }, error: null }));
      mockAdminFrom.mockReturnValue(mockArrayChain({ data: [], error: null }));

      try {
        await shareLinkService.createShareLink(PROJECT_ID, USER_ID, TOKEN);
        expect.unreachable('Should have thrown');
      } catch (err) {
        expect((err as AppError).statusCode).toBe(400);
        expect((err as AppError).code).toBe('NO_RENDERED_VERSION');
      }
    });

    it('should set expires_at when expires_in_days provided', async () => {
      mockFrom.mockReturnValue(mockChain({ data: { id: PROJECT_ID }, error: null }));

      const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      const version = { id: VERSION_ID, version_number: 1 };
      const shareLink = {
        id: 'share-3',
        share_token: SHARE_TOKEN,
        expires_at: futureDate,
        project_id: PROJECT_ID,
        version_id: VERSION_ID,
        include_watermark: true,
        view_count: 0,
        created_at: '2026-03-01T00:00:00Z',
      };

      let adminCallCount = 0;
      mockAdminFrom.mockImplementation(() => {
        adminCallCount++;
        if (adminCallCount === 1) {
          return mockArrayChain({ data: [version], error: null });
        }
        return mockChain({ data: shareLink, error: null });
      });

      mockGetByUserId.mockResolvedValue(null);

      const result = await shareLinkService.createShareLink(
        PROJECT_ID,
        USER_ID,
        TOKEN,
        { expires_in_days: 7 },
      );

      expect(result.expires_at).toBe(futureDate);
    });
  });

  describe('getByToken', () => {
    it('should return share data and increment view count', async () => {
      const shareLink = {
        id: 'share-1',
        project_id: PROJECT_ID,
        version_id: VERSION_ID,
        share_token: SHARE_TOKEN,
        include_watermark: false,
        expires_at: null,
        view_count: 5,
        created_at: '2026-03-01T00:00:00Z',
      };

      const version = {
        id: VERSION_ID,
        image_url: 'rendered.jpg',
        render_url: 'render.jpg',
        created_at: '2026-03-01T00:00:00Z',
      };

      const project = {
        name: 'Sala Moderna',
        style: 'moderno',
        original_image_url: 'original.jpg',
      };

      let adminCallCount = 0;
      mockAdminFrom.mockImplementation(() => {
        adminCallCount++;
        if (adminCallCount === 1) {
          return mockChain({ data: shareLink, error: null });
        }
        if (adminCallCount === 2) {
          // update view_count
          return mockChain({ data: null, error: null });
        }
        if (adminCallCount === 3) {
          return mockChain({ data: version, error: null });
        }
        return mockChain({ data: project, error: null });
      });

      const result = await shareLinkService.getByToken(SHARE_TOKEN);

      expect(result.original_url).toBe('original.jpg');
      expect(result.rendered_url).toBe('render.jpg');
      expect(result.project_name).toBe('Sala Moderna');
      expect(result.include_watermark).toBe(false);
      expect(result.og.title).toBe('Sala Moderna | DecorAI');
      expect(result.og.description).toBe('Veja a transformacao do ambiente');
    });

    it('should return 410 for expired share token', async () => {
      const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const shareLink = {
        id: 'share-1',
        share_token: SHARE_TOKEN,
        expires_at: pastDate,
        view_count: 0,
        created_at: '2026-03-01T00:00:00Z',
      };

      mockAdminFrom.mockReturnValue(mockChain({ data: shareLink, error: null }));

      try {
        await shareLinkService.getByToken(SHARE_TOKEN);
        expect.unreachable('Should have thrown');
      } catch (err) {
        expect((err as AppError).statusCode).toBe(410);
        expect((err as AppError).code).toBe('SHARE_EXPIRED');
      }
    });

    it('should return 404 for invalid share token', async () => {
      mockAdminFrom.mockReturnValue(mockChain({ data: null, error: { code: 'PGRST116' } }));

      try {
        await shareLinkService.getByToken('invalid-token');
        expect.unreachable('Should have thrown');
      } catch (err) {
        expect((err as AppError).statusCode).toBe(404);
        expect((err as AppError).code).toBe('SHARE_NOT_FOUND');
      }
    });
  });

  describe('listByProject', () => {
    it('should list all share links for a project', async () => {
      mockFrom.mockReturnValue(mockChain({ data: { id: PROJECT_ID }, error: null }));

      const shares = [
        {
          id: 'share-1',
          share_token: 'token1',
          version_id: VERSION_ID,
          view_count: 10,
          expires_at: null,
          created_at: '2026-03-01T00:00:00Z',
          project_id: PROJECT_ID,
          include_watermark: true,
        },
        {
          id: 'share-2',
          share_token: 'token2',
          version_id: VERSION_ID,
          view_count: 3,
          expires_at: '2026-04-01T00:00:00Z',
          created_at: '2026-03-02T00:00:00Z',
          project_id: PROJECT_ID,
          include_watermark: false,
        },
      ];

      mockAdminFrom.mockReturnValue(mockArrayChain({ data: shares, error: null }));

      const result = await shareLinkService.listByProject(PROJECT_ID, USER_ID, TOKEN);

      expect(result).toHaveLength(2);
      expect(result[0].share_id).toBe('share-1');
      expect(result[0].is_active).toBe(true);
      expect(result[1].view_count).toBe(3);
    });

    it('should return 403 when project not owned', async () => {
      mockFrom.mockReturnValue(mockChain({ data: null, error: null }));

      try {
        await shareLinkService.listByProject(PROJECT_ID, USER_ID, TOKEN);
        expect.unreachable('Should have thrown');
      } catch (err) {
        expect((err as AppError).statusCode).toBe(403);
      }
    });
  });

  describe('deleteShareLink', () => {
    it('should delete share link successfully', async () => {
      mockFrom.mockReturnValue(mockChain({ data: { id: PROJECT_ID }, error: null }));

      let adminCallCount = 0;
      mockAdminFrom.mockImplementation(() => {
        adminCallCount++;
        if (adminCallCount === 1) {
          return mockChain({ data: { id: 'share-1' }, error: null });
        }
        return mockChain({ data: null, error: null });
      });

      await expect(
        shareLinkService.deleteShareLink(PROJECT_ID, 'share-1', USER_ID, TOKEN),
      ).resolves.toBeUndefined();
    });

    it('should return 404 when share link not found', async () => {
      mockFrom.mockReturnValue(mockChain({ data: { id: PROJECT_ID }, error: null }));
      mockAdminFrom.mockReturnValue(mockChain({ data: null, error: null }));

      try {
        await shareLinkService.deleteShareLink(PROJECT_ID, 'nonexistent', USER_ID, TOKEN);
        expect.unreachable('Should have thrown');
      } catch (err) {
        expect((err as AppError).statusCode).toBe(404);
        expect((err as AppError).code).toBe('SHARE_NOT_FOUND');
      }
    });

    it('should return 403 when project not owned', async () => {
      mockFrom.mockReturnValue(mockChain({ data: null, error: null }));

      try {
        await shareLinkService.deleteShareLink(PROJECT_ID, 'share-1', USER_ID, TOKEN);
        expect.unreachable('Should have thrown');
      } catch (err) {
        expect((err as AppError).statusCode).toBe(403);
      }
    });
  });
});
