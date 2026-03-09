import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../lib/stripe', () => ({
  stripe: {
    subscriptions: { retrieve: vi.fn() },
  },
}));

vi.mock('../lib/supabase', () => ({
  supabaseAdmin: { from: vi.fn() },
  createUserClient: vi.fn(),
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

vi.mock('../services/subscription.service', () => ({
  subscriptionService: {
    getByUserId: vi.fn(),
    activateSubscription: vi.fn(),
    renewSubscription: vi.fn(),
    markPastDue: vi.fn(),
    downgradeToFree: vi.fn(),
  },
}));

import {
  handleCheckoutCompleted,
  handleInvoicePaid,
  handleInvoicePaymentFailed,
  handleSubscriptionDeleted,
} from '../services/webhook-handlers';
import { supabaseAdmin } from '../lib/supabase';
import { stripe } from '../lib/stripe';
import { subscriptionService } from '../services/subscription.service';
import type Stripe from 'stripe';

const mockAdmin = supabaseAdmin as { from: ReturnType<typeof vi.fn> };
const mockStripe = vi.mocked(stripe);
const mockSubService = vi.mocked(subscriptionService);

function mockChain(result: { data?: unknown; error?: unknown }) {
  const chain: Record<string, unknown> = {};
  chain.select = vi.fn().mockReturnValue(chain);
  chain.insert = vi.fn().mockResolvedValue(result);
  chain.eq = vi.fn().mockReturnValue(chain);
  chain.single = vi.fn().mockResolvedValue(result);
  return chain;
}

function makeEvent(type: string, data: unknown, id = 'evt_test'): Stripe.Event {
  return {
    id,
    type,
    data: { object: data },
  } as unknown as Stripe.Event;
}

describe('webhook handlers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('handleCheckoutCompleted', () => {
    it('should activate subscription on checkout completed', async () => {
      // Mock idempotency check — not processed
      const idempChain = mockChain({ data: null, error: { code: 'PGRST116' } });
      const markChain = mockChain({ data: null, error: null });

      let callCount = 0;
      mockAdmin.from.mockImplementation(() => {
        callCount++;
        return callCount === 1 ? idempChain : markChain;
      });

      mockStripe.subscriptions.retrieve.mockResolvedValue({
        current_period_start: 1704067200,
        current_period_end: 1706745600,
      } as never);

      const event = makeEvent('checkout.session.completed', {
        metadata: { user_id: 'user-123', tier: 'pro' },
        client_reference_id: 'user-123',
        subscription: 'sub_123',
        customer: 'cus_123',
      });

      await handleCheckoutCompleted(event);

      expect(mockSubService.activateSubscription).toHaveBeenCalledWith(
        'user-123',
        'pro',
        'cus_123',
        'sub_123',
        expect.any(String),
        expect.any(String),
      );
    });

    it('should skip already processed events (idempotency)', async () => {
      const idempChain = mockChain({ data: { id: 'existing' }, error: null });
      mockAdmin.from.mockReturnValue(idempChain);

      const event = makeEvent('checkout.session.completed', {
        metadata: { user_id: 'user-123', tier: 'pro' },
        subscription: 'sub_123',
        customer: 'cus_123',
      });

      await handleCheckoutCompleted(event);

      expect(mockSubService.activateSubscription).not.toHaveBeenCalled();
    });
  });

  describe('handleInvoicePaid', () => {
    it('should renew subscription on invoice paid', async () => {
      // idempotency: not processed
      const idempChain = mockChain({ data: null, error: { code: 'PGRST116' } });
      // find user by customer id
      const findChain = mockChain({ data: { user_id: 'user-456' }, error: null });
      // mark processed
      const markChain = mockChain({ data: null, error: null });

      let callCount = 0;
      mockAdmin.from.mockImplementation(() => {
        callCount++;
        if (callCount === 1) return idempChain;
        if (callCount === 2) return findChain;
        return markChain;
      });

      mockStripe.subscriptions.retrieve.mockResolvedValue({
        current_period_start: 1706745600,
        current_period_end: 1709424000,
      } as never);

      const event = makeEvent('invoice.paid', {
        customer: 'cus_456',
        subscription: 'sub_456',
      });

      await handleInvoicePaid(event);

      expect(mockSubService.renewSubscription).toHaveBeenCalledWith(
        'user-456',
        expect.any(String),
        expect.any(String),
      );
    });
  });

  describe('handleInvoicePaymentFailed', () => {
    it('should mark subscription as past_due', async () => {
      const idempChain = mockChain({ data: null, error: { code: 'PGRST116' } });
      const findChain = mockChain({ data: { user_id: 'user-789' }, error: null });
      const markChain = mockChain({ data: null, error: null });

      let callCount = 0;
      mockAdmin.from.mockImplementation(() => {
        callCount++;
        if (callCount === 1) return idempChain;
        if (callCount === 2) return findChain;
        return markChain;
      });

      const event = makeEvent('invoice.payment_failed', {
        customer: 'cus_789',
      });

      await handleInvoicePaymentFailed(event);

      expect(mockSubService.markPastDue).toHaveBeenCalledWith('user-789');
    });
  });

  describe('handleSubscriptionDeleted', () => {
    it('should downgrade to free on subscription deleted', async () => {
      const idempChain = mockChain({ data: null, error: { code: 'PGRST116' } });
      const findChain = mockChain({ data: { user_id: 'user-del' }, error: null });
      const markChain = mockChain({ data: null, error: null });

      let callCount = 0;
      mockAdmin.from.mockImplementation(() => {
        callCount++;
        if (callCount === 1) return idempChain;
        if (callCount === 2) return findChain;
        return markChain;
      });

      const event = makeEvent('customer.subscription.deleted', {
        customer: 'cus_del',
      });

      await handleSubscriptionDeleted(event);

      expect(mockSubService.downgradeToFree).toHaveBeenCalledWith('user-del');
    });
  });
});
