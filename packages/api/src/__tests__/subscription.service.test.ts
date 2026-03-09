import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../lib/stripe', () => ({
  stripe: {
    checkout: {
      sessions: { create: vi.fn() },
    },
    billingPortal: {
      sessions: { create: vi.fn() },
    },
    subscriptions: { retrieve: vi.fn() },
  },
}));

vi.mock('../lib/supabase', () => {
  const mockFrom = vi.fn();
  return {
    supabaseAdmin: { from: mockFrom },
    createUserClient: vi.fn(),
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
    STRIPE_SECRET_KEY: 'sk_test_xxx',
    STRIPE_WEBHOOK_SECRET: 'whsec_xxx',
    STRIPE_PRO_PRICE_ID: 'price_pro',
    STRIPE_BUSINESS_PRICE_ID: 'price_business',
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

import { subscriptionService } from '../services/subscription.service';
import { supabaseAdmin } from '../lib/supabase';
import { stripe } from '../lib/stripe';
import { AppError } from '../lib/errors';

const mockStripe = vi.mocked(stripe);
const mockAdmin = supabaseAdmin as { from: ReturnType<typeof vi.fn> };

const USER_ID = 'user-123';

function mockChain(result: { data?: unknown; error?: unknown; count?: number }) {
  const chain: Record<string, unknown> = {};

  chain.select = vi.fn().mockReturnValue(chain);
  chain.insert = vi.fn().mockReturnValue(chain);
  chain.update = vi.fn().mockReturnValue(chain);
  chain.eq = vi.fn().mockReturnValue(chain);
  chain.single = vi.fn().mockResolvedValue(result);

  return chain;
}

describe('subscriptionService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getByUserId', () => {
    it('should return subscription for user', async () => {
      const mockSub = {
        id: 'sub-1',
        user_id: USER_ID,
        tier: 'pro',
        status: 'active',
      };

      mockAdmin.from.mockReturnValue(mockChain({ data: mockSub, error: null }));

      const result = await subscriptionService.getByUserId(USER_ID);

      expect(result).toEqual(mockSub);
      expect(mockAdmin.from).toHaveBeenCalledWith('subscriptions');
    });

    it('should return null when no subscription found', async () => {
      mockAdmin.from.mockReturnValue(mockChain({ data: null, error: { code: 'PGRST116' } }));

      const result = await subscriptionService.getByUserId(USER_ID);

      expect(result).toBeNull();
    });
  });

  describe('createCheckoutSession', () => {
    it('should create checkout session for pro tier', async () => {
      // Mock getByUserId → no existing subscription
      mockAdmin.from.mockReturnValue(mockChain({ data: null, error: { code: 'PGRST116' } }));

      mockStripe.checkout.sessions.create.mockResolvedValue({
        url: 'https://checkout.stripe.com/session/cs_test_123',
      } as never);

      const result = await subscriptionService.createCheckoutSession(USER_ID, 'pro');

      expect(result).toEqual({ checkout_url: 'https://checkout.stripe.com/session/cs_test_123' });
      expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          mode: 'subscription',
          line_items: [{ price: 'price_pro', quantity: 1 }],
          metadata: { user_id: USER_ID, tier: 'pro' },
          client_reference_id: USER_ID,
        }),
      );
    });

    it('should create checkout session for business tier', async () => {
      mockAdmin.from.mockReturnValue(mockChain({ data: null, error: { code: 'PGRST116' } }));

      mockStripe.checkout.sessions.create.mockResolvedValue({
        url: 'https://checkout.stripe.com/session/cs_test_biz',
      } as never);

      const result = await subscriptionService.createCheckoutSession(USER_ID, 'business');

      expect(result).toEqual({ checkout_url: 'https://checkout.stripe.com/session/cs_test_biz' });
      expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          line_items: [{ price: 'price_business', quantity: 1 }],
        }),
      );
    });

    it('should throw if user already has active paid subscription', async () => {
      mockAdmin.from.mockReturnValue(
        mockChain({
          data: { id: 'sub-1', status: 'active', tier: 'pro' },
          error: null,
        }),
      );

      await expect(
        subscriptionService.createCheckoutSession(USER_ID, 'pro'),
      ).rejects.toThrow(AppError);

      await expect(
        subscriptionService.createCheckoutSession(USER_ID, 'pro'),
      ).rejects.toMatchObject({ code: 'ALREADY_SUBSCRIBED', statusCode: 409 });
    });

    it('should throw for invalid tier', async () => {
      await expect(
        subscriptionService.createCheckoutSession(USER_ID, 'invalid'),
      ).rejects.toThrow(AppError);
    });
  });

  describe('createPortalSession', () => {
    it('should create portal session', async () => {
      mockAdmin.from.mockReturnValue(
        mockChain({
          data: { gateway_customer_id: 'cus_123' },
          error: null,
        }),
      );

      mockStripe.billingPortal.sessions.create.mockResolvedValue({
        url: 'https://billing.stripe.com/portal/session/bps_123',
      } as never);

      const result = await subscriptionService.createPortalSession(USER_ID);

      expect(result).toEqual({
        portal_url: 'https://billing.stripe.com/portal/session/bps_123',
      });
    });

    it('should throw when no subscription found', async () => {
      mockAdmin.from.mockReturnValue(mockChain({ data: null, error: { code: 'PGRST116' } }));

      await expect(subscriptionService.createPortalSession(USER_ID)).rejects.toMatchObject({
        code: 'NO_SUBSCRIPTION',
        statusCode: 404,
      });
    });
  });

  describe('activateSubscription', () => {
    it('should update existing subscription record', async () => {
      const selectChain = mockChain({ data: { id: 'sub-1' }, error: null });
      const updateChain = mockChain({ data: null, error: null });

      let callCount = 0;
      mockAdmin.from.mockImplementation(() => {
        callCount++;
        return callCount === 1 ? selectChain : updateChain;
      });

      await subscriptionService.activateSubscription(
        USER_ID,
        'pro',
        'cus_123',
        'sub_123',
        '2026-01-01T00:00:00Z',
        '2026-02-01T00:00:00Z',
      );

      expect(mockAdmin.from).toHaveBeenCalledWith('subscriptions');
    });

    it('should insert new subscription record when none exists', async () => {
      const selectChain = mockChain({ data: null, error: { code: 'PGRST116' } });
      const insertChain: Record<string, unknown> = {};
      insertChain.insert = vi.fn().mockResolvedValue({ error: null });

      let callCount = 0;
      mockAdmin.from.mockImplementation(() => {
        callCount++;
        return callCount === 1 ? selectChain : insertChain;
      });

      await subscriptionService.activateSubscription(
        USER_ID,
        'business',
        'cus_456',
        'sub_456',
        '2026-01-01T00:00:00Z',
        '2026-02-01T00:00:00Z',
      );

      expect(mockAdmin.from).toHaveBeenCalledWith('subscriptions');
    });
  });

  describe('renewSubscription', () => {
    it('should reset renders and update period', async () => {
      const chain = mockChain({ data: null, error: null });
      mockAdmin.from.mockReturnValue(chain);

      await subscriptionService.renewSubscription(
        USER_ID,
        '2026-02-01T00:00:00Z',
        '2026-03-01T00:00:00Z',
      );

      expect(mockAdmin.from).toHaveBeenCalledWith('subscriptions');
      expect(chain.update).toHaveBeenCalledWith(
        expect.objectContaining({
          renders_used: 0,
          status: 'active',
        }),
      );
    });
  });

  describe('markPastDue', () => {
    it('should set status to past_due', async () => {
      const chain = mockChain({ data: null, error: null });
      mockAdmin.from.mockReturnValue(chain);

      await subscriptionService.markPastDue(USER_ID);

      expect(chain.update).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'past_due' }),
      );
    });
  });

  describe('downgradeToFree', () => {
    it('should downgrade to free tier with correct limits', async () => {
      const chain = mockChain({ data: null, error: null });
      mockAdmin.from.mockReturnValue(chain);

      await subscriptionService.downgradeToFree(USER_ID);

      expect(chain.update).toHaveBeenCalledWith(
        expect.objectContaining({
          tier: 'free',
          status: 'canceled',
          renders_limit: 3,
          gateway_subscription_id: null,
        }),
      );
    });
  });

  describe('getGracePeriodEnd', () => {
    it('should return date 3 days after input', () => {
      const from = new Date('2026-03-01T00:00:00Z');
      const end = subscriptionService.getGracePeriodEnd(from);

      expect(end.toISOString()).toBe('2026-03-04T00:00:00.000Z');
    });
  });
});
