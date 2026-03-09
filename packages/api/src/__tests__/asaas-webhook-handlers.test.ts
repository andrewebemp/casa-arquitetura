import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../lib/supabase', () => ({
  supabaseAdmin: { from: vi.fn() },
  createUserClient: vi.fn(),
}));

vi.mock('../config/env', () => ({
  env: {
    ASAAS_API_KEY: 'test-asaas-key',
    ASAAS_API_URL: 'https://sandbox.asaas.com/api',
    ASAAS_WEBHOOK_TOKEN: 'test-webhook-token',
    ASAAS_PRO_VALUE: '79.00',
    ASAAS_BUSINESS_VALUE: '299.00',
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
  handleAsaasPaymentConfirmed,
  handleAsaasPaymentReceived,
  handleAsaasPaymentOverdue,
  handleAsaasSubscriptionDeleted,
} from '../services/asaas-webhook-handlers';
import { supabaseAdmin } from '../lib/supabase';
import { subscriptionService } from '../services/subscription.service';
import type { AsaasWebhookPayload } from '@decorai/shared';

const mockAdmin = supabaseAdmin as { from: ReturnType<typeof vi.fn> };

function mockChain(result: { data?: unknown; error?: unknown }) {
  const chain: Record<string, unknown> = {};
  chain.select = vi.fn().mockReturnValue(chain);
  chain.insert = vi.fn().mockResolvedValue(result);
  chain.eq = vi.fn().mockReturnValue(chain);
  chain.single = vi.fn().mockResolvedValue(result);
  return chain;
}

describe('Asaas webhook handlers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('handleAsaasPaymentConfirmed', () => {
    it('should activate subscription on PAYMENT_CONFIRMED', async () => {
      const payload: AsaasWebhookPayload = {
        event: 'PAYMENT_CONFIRMED',
        payment: {
          id: 'pay_123',
          customer: 'cus_123',
          subscription: 'sub_123',
          billingType: 'PIX',
          value: 79.00,
          status: 'CONFIRMED',
          dueDate: '2026-03-10',
        },
      };

      // Mock isEventProcessed → not processed
      const eventCheckChain = mockChain({ data: null, error: { code: 'PGRST116' } });
      // Mock findUserByAsaasCustomerId → found user
      const userChain = mockChain({ data: { user_id: 'user-123' }, error: null });
      // Mock markEventProcessed
      const insertChain = mockChain({ data: null, error: null });

      let callCount = 0;
      mockAdmin.from.mockImplementation(() => {
        callCount++;
        if (callCount === 1) return eventCheckChain;
        if (callCount === 2) return userChain;
        return insertChain;
      });

      await handleAsaasPaymentConfirmed(payload);

      expect(subscriptionService.activateSubscription).toHaveBeenCalledWith(
        'user-123',
        'pro',
        'cus_123',
        'sub_123',
        expect.any(String),
        expect.any(String),
        'asaas',
      );
    });

    it('should resolve business tier for value >= 299', async () => {
      const payload: AsaasWebhookPayload = {
        event: 'PAYMENT_CONFIRMED',
        payment: {
          id: 'pay_456',
          customer: 'cus_456',
          subscription: 'sub_456',
          billingType: 'CREDIT_CARD',
          value: 299.00,
          status: 'CONFIRMED',
          dueDate: '2026-03-10',
        },
      };

      const eventCheckChain = mockChain({ data: null, error: { code: 'PGRST116' } });
      const userChain = mockChain({ data: { user_id: 'user-456' }, error: null });
      const insertChain = mockChain({ data: null, error: null });

      let callCount = 0;
      mockAdmin.from.mockImplementation(() => {
        callCount++;
        if (callCount === 1) return eventCheckChain;
        if (callCount === 2) return userChain;
        return insertChain;
      });

      await handleAsaasPaymentConfirmed(payload);

      expect(subscriptionService.activateSubscription).toHaveBeenCalledWith(
        'user-456',
        'business',
        'cus_456',
        'sub_456',
        expect.any(String),
        expect.any(String),
        'asaas',
      );
    });

    it('should skip already processed events', async () => {
      const payload: AsaasWebhookPayload = {
        event: 'PAYMENT_CONFIRMED',
        payment: {
          id: 'pay_123',
          customer: 'cus_123',
          billingType: 'PIX',
          value: 79.00,
          status: 'CONFIRMED',
          dueDate: '2026-03-10',
        },
      };

      const eventCheckChain = mockChain({ data: { id: 'existing' }, error: null });
      mockAdmin.from.mockReturnValue(eventCheckChain);

      await handleAsaasPaymentConfirmed(payload);

      expect(subscriptionService.activateSubscription).not.toHaveBeenCalled();
    });

    it('should skip when no user found for customer', async () => {
      const payload: AsaasWebhookPayload = {
        event: 'PAYMENT_CONFIRMED',
        payment: {
          id: 'pay_999',
          customer: 'cus_unknown',
          billingType: 'PIX',
          value: 79.00,
          status: 'CONFIRMED',
          dueDate: '2026-03-10',
        },
      };

      const eventCheckChain = mockChain({ data: null, error: { code: 'PGRST116' } });
      const userChain = mockChain({ data: null, error: { code: 'PGRST116' } });

      let callCount = 0;
      mockAdmin.from.mockImplementation(() => {
        callCount++;
        return callCount === 1 ? eventCheckChain : userChain;
      });

      await handleAsaasPaymentConfirmed(payload);

      expect(subscriptionService.activateSubscription).not.toHaveBeenCalled();
    });
  });

  describe('handleAsaasPaymentReceived', () => {
    it('should renew subscription on PAYMENT_RECEIVED', async () => {
      const payload: AsaasWebhookPayload = {
        event: 'PAYMENT_RECEIVED',
        payment: {
          id: 'pay_renewal',
          customer: 'cus_123',
          billingType: 'BOLETO',
          value: 79.00,
          status: 'RECEIVED',
          dueDate: '2026-04-10',
        },
      };

      const eventCheckChain = mockChain({ data: null, error: { code: 'PGRST116' } });
      const userChain = mockChain({ data: { user_id: 'user-123' }, error: null });
      const insertChain = mockChain({ data: null, error: null });

      let callCount = 0;
      mockAdmin.from.mockImplementation(() => {
        callCount++;
        if (callCount === 1) return eventCheckChain;
        if (callCount === 2) return userChain;
        return insertChain;
      });

      await handleAsaasPaymentReceived(payload);

      expect(subscriptionService.renewSubscription).toHaveBeenCalledWith(
        'user-123',
        expect.any(String),
        expect.any(String),
      );
    });
  });

  describe('handleAsaasPaymentOverdue', () => {
    it('should mark subscription as past_due on PAYMENT_OVERDUE', async () => {
      const payload: AsaasWebhookPayload = {
        event: 'PAYMENT_OVERDUE',
        payment: {
          id: 'pay_overdue',
          customer: 'cus_123',
          billingType: 'BOLETO',
          value: 79.00,
          status: 'OVERDUE',
          dueDate: '2026-03-10',
        },
      };

      const eventCheckChain = mockChain({ data: null, error: { code: 'PGRST116' } });
      const userChain = mockChain({ data: { user_id: 'user-123' }, error: null });
      const insertChain = mockChain({ data: null, error: null });

      let callCount = 0;
      mockAdmin.from.mockImplementation(() => {
        callCount++;
        if (callCount === 1) return eventCheckChain;
        if (callCount === 2) return userChain;
        return insertChain;
      });

      await handleAsaasPaymentOverdue(payload);

      expect(subscriptionService.markPastDue).toHaveBeenCalledWith('user-123');
    });
  });

  describe('handleAsaasSubscriptionDeleted', () => {
    it('should downgrade to free on SUBSCRIPTION_DELETED', async () => {
      const payload: AsaasWebhookPayload = {
        event: 'SUBSCRIPTION_DELETED',
        subscription: {
          id: 'sub_123',
          customer: 'cus_123',
          billingType: 'PIX',
          value: 79.00,
          nextDueDate: '2026-04-10',
          status: 'INACTIVE',
          cycle: 'MONTHLY',
        },
      };

      const eventCheckChain = mockChain({ data: null, error: { code: 'PGRST116' } });
      const userChain = mockChain({ data: { user_id: 'user-123' }, error: null });
      const insertChain = mockChain({ data: null, error: null });

      let callCount = 0;
      mockAdmin.from.mockImplementation(() => {
        callCount++;
        if (callCount === 1) return eventCheckChain;
        if (callCount === 2) return userChain;
        return insertChain;
      });

      await handleAsaasSubscriptionDeleted(payload);

      expect(subscriptionService.downgradeToFree).toHaveBeenCalledWith('user-123');
    });
  });
});
