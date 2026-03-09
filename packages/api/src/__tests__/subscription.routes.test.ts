import { describe, it, expect, vi, beforeEach } from 'vitest';
import Fastify from 'fastify';
import type { FastifyInstance } from 'fastify';

vi.mock('../lib/stripe', () => ({
  stripe: {
    checkout: { sessions: { create: vi.fn() } },
    billingPortal: { sessions: { create: vi.fn() } },
    webhooks: { constructEvent: vi.fn() },
    subscriptions: { retrieve: vi.fn() },
  },
}));

vi.mock('../lib/supabase', () => ({
  supabaseAdmin: {
    auth: { getUser: vi.fn() },
    from: vi.fn(),
  },
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
    OPENROUTER_API_KEY: 'sk-or-test',
    ASAAS_API_KEY: 'test-asaas-key',
    ASAAS_API_URL: 'https://sandbox.asaas.com/api',
    ASAAS_WEBHOOK_TOKEN: 'test-webhook-token',
    ASAAS_PRO_VALUE: '79.00',
    ASAAS_BUSINESS_VALUE: '299.00',
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
    createCheckoutSession: vi.fn(),
    createPortalSession: vi.fn(),
    activateSubscription: vi.fn(),
    renewSubscription: vi.fn(),
    markPastDue: vi.fn(),
    downgradeToFree: vi.fn(),
  },
}));

vi.mock('../services/webhook-handlers', () => ({
  handleCheckoutCompleted: vi.fn(),
  handleInvoicePaid: vi.fn(),
  handleInvoicePaymentFailed: vi.fn(),
  handleSubscriptionDeleted: vi.fn(),
}));

import { subscriptionRoutes } from '../routes/subscription.routes';
import { webhookRoutes } from '../routes/webhook.routes';
import { errorHandler } from '../middleware/error-handler';
import { subscriptionService } from '../services/subscription.service';
import { supabaseAdmin } from '../lib/supabase';
import { stripe } from '../lib/stripe';
import {
  handleCheckoutCompleted,
  handleInvoicePaid,
  handleInvoicePaymentFailed,
  handleSubscriptionDeleted,
} from '../services/webhook-handlers';

const mockSubscriptionService = vi.mocked(subscriptionService);
const mockGetUser = vi.mocked(supabaseAdmin.auth.getUser);
const mockStripe = vi.mocked(stripe);

const MOCK_USER = {
  id: 'user-123',
  email: 'test@example.com',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  created_at: '2024-01-01',
};

const authHeaders = { authorization: 'Bearer valid-token' };

const buildSubApp = async (): Promise<FastifyInstance> => {
  const app = Fastify({ logger: false });
  app.setErrorHandler(errorHandler);
  await app.register(subscriptionRoutes, { prefix: '/subscriptions' });
  await app.ready();
  return app;
};

const buildWebhookApp = async (): Promise<FastifyInstance> => {
  const app = Fastify({ logger: false });
  app.setErrorHandler(errorHandler);
  await app.register(webhookRoutes, { prefix: '/webhooks' });
  await app.ready();
  return app;
};

describe('subscription routes', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockGetUser.mockResolvedValue({
      data: { user: MOCK_USER },
      error: null,
    } as never);
    app = await buildSubApp();
  });

  describe('POST /subscriptions/checkout', () => {
    it('should create checkout session', async () => {
      mockSubscriptionService.createCheckoutSession.mockResolvedValue({
        checkout_url: 'https://checkout.stripe.com/cs_test_123',
      });

      const res = await app.inject({
        method: 'POST',
        url: '/subscriptions/checkout',
        headers: authHeaders,
        payload: { tier: 'pro', gateway: 'stripe' },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body.data.checkout_url).toBe('https://checkout.stripe.com/cs_test_123');
      expect(mockSubscriptionService.createCheckoutSession).toHaveBeenCalledWith('user-123', 'pro', 'stripe', undefined); // gateway + payment_method
    });

    it('should return 400 for invalid tier', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/subscriptions/checkout',
        headers: authHeaders,
        payload: { tier: 'invalid', gateway: 'stripe' },
      });

      expect(res.statusCode).toBe(400);
    });

    it('should return 400 for invalid gateway', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/subscriptions/checkout',
        headers: authHeaders,
        payload: { tier: 'pro', gateway: 'paypal' },
      });

      expect(res.statusCode).toBe(400);
    });

    it('should return 401 without auth header', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid token' },
      } as never);

      const res = await app.inject({
        method: 'POST',
        url: '/subscriptions/checkout',
        payload: { tier: 'pro', gateway: 'stripe' },
      });

      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /subscriptions/me', () => {
    it('should return subscription details for subscribed user', async () => {
      const mockSub = {
        id: 'sub-1',
        user_id: 'user-123',
        tier: 'pro',
        status: 'active',
        renders_used: 5,
        renders_limit: 100,
        current_period_start: '2026-01-01T00:00:00Z',
        current_period_end: '2026-02-01T00:00:00Z',
        gateway_customer_id: 'cus_123',
        payment_gateway: 'stripe',
      };

      mockSubscriptionService.getByUserId.mockResolvedValue(mockSub as never);
      mockStripe.billingPortal.sessions.create.mockResolvedValue({
        url: 'https://billing.stripe.com/portal',
      } as never);

      const res = await app.inject({
        method: 'GET',
        url: '/subscriptions/me',
        headers: authHeaders,
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body.data.tier).toBe('pro');
      expect(body.data.portal_url).toBe('https://billing.stripe.com/portal');
    });

    it('should return free tier defaults when no subscription exists', async () => {
      mockSubscriptionService.getByUserId.mockResolvedValue(null);

      const res = await app.inject({
        method: 'GET',
        url: '/subscriptions/me',
        headers: authHeaders,
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body.data.tier).toBe('free');
      expect(body.data.renders_limit).toBe(3);
      expect(body.data.portal_url).toBeNull();
    });
  });

  describe('POST /subscriptions/portal', () => {
    it('should create billing portal session', async () => {
      mockSubscriptionService.createPortalSession.mockResolvedValue({
        portal_url: 'https://billing.stripe.com/portal/bps_123',
      });

      const res = await app.inject({
        method: 'POST',
        url: '/subscriptions/portal',
        headers: authHeaders,
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body.data.portal_url).toBe('https://billing.stripe.com/portal/bps_123');
    });
  });
});

describe('webhook routes', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    vi.clearAllMocks();
    app = await buildWebhookApp();
  });

  describe('POST /webhooks/stripe', () => {
    it('should reject request without Stripe-Signature header', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/webhooks/stripe',
        payload: '{}',
        headers: { 'content-type': 'application/json' },
      });

      expect(res.statusCode).toBe(400);
      const body = JSON.parse(res.body);
      expect(body.error.code).toBe('MISSING_SIGNATURE');
    });

    it('should reject invalid signature', async () => {
      mockStripe.webhooks.constructEvent.mockImplementation(() => {
        throw new Error('Invalid signature');
      });

      const res = await app.inject({
        method: 'POST',
        url: '/webhooks/stripe',
        payload: '{}',
        headers: {
          'content-type': 'application/json',
          'stripe-signature': 'invalid_sig',
        },
      });

      expect(res.statusCode).toBe(400);
      const body = JSON.parse(res.body);
      expect(body.error.code).toBe('INVALID_SIGNATURE');
    });

    it('should handle checkout.session.completed event', async () => {
      const event = {
        id: 'evt_123',
        type: 'checkout.session.completed',
        data: { object: {} },
      };

      mockStripe.webhooks.constructEvent.mockReturnValue(event as never);

      const res = await app.inject({
        method: 'POST',
        url: '/webhooks/stripe',
        payload: JSON.stringify(event),
        headers: {
          'content-type': 'application/json',
          'stripe-signature': 'valid_sig',
        },
      });

      expect(res.statusCode).toBe(200);
      expect(handleCheckoutCompleted).toHaveBeenCalledWith(event);
    });

    it('should handle invoice.paid event', async () => {
      const event = {
        id: 'evt_456',
        type: 'invoice.paid',
        data: { object: {} },
      };

      mockStripe.webhooks.constructEvent.mockReturnValue(event as never);

      const res = await app.inject({
        method: 'POST',
        url: '/webhooks/stripe',
        payload: JSON.stringify(event),
        headers: {
          'content-type': 'application/json',
          'stripe-signature': 'valid_sig',
        },
      });

      expect(res.statusCode).toBe(200);
      expect(handleInvoicePaid).toHaveBeenCalledWith(event);
    });

    it('should handle invoice.payment_failed event', async () => {
      const event = {
        id: 'evt_789',
        type: 'invoice.payment_failed',
        data: { object: {} },
      };

      mockStripe.webhooks.constructEvent.mockReturnValue(event as never);

      const res = await app.inject({
        method: 'POST',
        url: '/webhooks/stripe',
        payload: JSON.stringify(event),
        headers: {
          'content-type': 'application/json',
          'stripe-signature': 'valid_sig',
        },
      });

      expect(res.statusCode).toBe(200);
      expect(handleInvoicePaymentFailed).toHaveBeenCalledWith(event);
    });

    it('should handle customer.subscription.deleted event', async () => {
      const event = {
        id: 'evt_del',
        type: 'customer.subscription.deleted',
        data: { object: {} },
      };

      mockStripe.webhooks.constructEvent.mockReturnValue(event as never);

      const res = await app.inject({
        method: 'POST',
        url: '/webhooks/stripe',
        payload: JSON.stringify(event),
        headers: {
          'content-type': 'application/json',
          'stripe-signature': 'valid_sig',
        },
      });

      expect(res.statusCode).toBe(200);
      expect(handleSubscriptionDeleted).toHaveBeenCalledWith(event);
    });

    it('should return 200 for unhandled event types', async () => {
      const event = {
        id: 'evt_unhandled',
        type: 'customer.updated',
        data: { object: {} },
      };

      mockStripe.webhooks.constructEvent.mockReturnValue(event as never);

      const res = await app.inject({
        method: 'POST',
        url: '/webhooks/stripe',
        payload: JSON.stringify(event),
        headers: {
          'content-type': 'application/json',
          'stripe-signature': 'valid_sig',
        },
      });

      expect(res.statusCode).toBe(200);
      expect(handleCheckoutCompleted).not.toHaveBeenCalled();
      expect(handleInvoicePaid).not.toHaveBeenCalled();
    });

    it('should return 500 if handler throws', async () => {
      const event = {
        id: 'evt_err',
        type: 'checkout.session.completed',
        data: { object: {} },
      };

      mockStripe.webhooks.constructEvent.mockReturnValue(event as never);
      vi.mocked(handleCheckoutCompleted).mockRejectedValue(new Error('DB error'));

      const res = await app.inject({
        method: 'POST',
        url: '/webhooks/stripe',
        payload: JSON.stringify(event),
        headers: {
          'content-type': 'application/json',
          'stripe-signature': 'valid_sig',
        },
      });

      expect(res.statusCode).toBe(500);
      const body = JSON.parse(res.body);
      expect(body.error.code).toBe('WEBHOOK_PROCESSING_ERROR');
    });
  });
});
