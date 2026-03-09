import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../lib/stripe', () => ({
  stripe: {
    checkout: { sessions: { create: vi.fn() } },
    billingPortal: { sessions: { create: vi.fn() } },
    subscriptions: { retrieve: vi.fn() },
  },
}));

vi.mock('../lib/asaas', () => ({
  asaasClient: {
    createSubscription: vi.fn(),
    findCustomerByEmail: vi.fn(),
    createCustomer: vi.fn(),
  },
}));

vi.mock('../services/asaas-customer.service', () => ({
  asaasCustomerService: {
    findOrCreate: vi.fn(),
  },
}));

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

import { subscriptionService } from '../services/subscription.service';
import { supabaseAdmin } from '../lib/supabase';
import { asaasClient } from '../lib/asaas';
import { asaasCustomerService } from '../services/asaas-customer.service';

const mockAdmin = supabaseAdmin as { from: ReturnType<typeof vi.fn> };
const mockAsaas = vi.mocked(asaasClient);
const mockAsaasCustomer = vi.mocked(asaasCustomerService);

const USER_ID = 'user-123';

function mockChain(result: { data?: unknown; error?: unknown }) {
  const chain: Record<string, unknown> = {};
  chain.select = vi.fn().mockReturnValue(chain);
  chain.insert = vi.fn().mockReturnValue(chain);
  chain.update = vi.fn().mockReturnValue(chain);
  chain.eq = vi.fn().mockReturnValue(chain);
  chain.single = vi.fn().mockResolvedValue(result);
  return chain;
}

describe('subscriptionService - Asaas checkout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createCheckoutSession with gateway=asaas', () => {
    it('should create Asaas checkout for pro tier with PIX', async () => {
      // Mock getByUserId → no existing subscription
      mockAdmin.from.mockReturnValue(mockChain({ data: null, error: { code: 'PGRST116' } }));

      mockAsaasCustomer.findOrCreate.mockResolvedValue({
        id: 'cus_asaas_1', name: 'Test', email: 'test@test.com', dateCreated: '2026-01-01',
      });

      mockAsaas.createSubscription.mockResolvedValue({
        id: 'sub_asaas_1',
        customer: 'cus_asaas_1',
        billingType: 'PIX',
        value: 79,
        nextDueDate: '2026-04-01',
        status: 'ACTIVE',
        cycle: 'MONTHLY',
      });

      const result = await subscriptionService.createCheckoutSession(USER_ID, 'pro', 'asaas', 'pix');

      expect(result).toMatchObject({
        gateway: 'asaas',
        subscription_id: 'sub_asaas_1',
        customer_id: 'cus_asaas_1',
        billing_type: 'PIX',
        payment_method: 'pix',
      });
      expect(mockAsaas.createSubscription).toHaveBeenCalledWith(
        expect.objectContaining({
          customer: 'cus_asaas_1',
          billingType: 'PIX',
          value: 79,
          cycle: 'MONTHLY',
        }),
      );
    });

    it('should create Asaas checkout for business tier with boleto', async () => {
      mockAdmin.from.mockReturnValue(mockChain({ data: null, error: { code: 'PGRST116' } }));

      mockAsaasCustomer.findOrCreate.mockResolvedValue({
        id: 'cus_asaas_2', name: 'Biz User', email: 'biz@test.com', dateCreated: '2026-01-01',
      });

      mockAsaas.createSubscription.mockResolvedValue({
        id: 'sub_asaas_2',
        customer: 'cus_asaas_2',
        billingType: 'BOLETO',
        value: 299,
        nextDueDate: '2026-04-01',
        status: 'ACTIVE',
        cycle: 'MONTHLY',
      });

      const result = await subscriptionService.createCheckoutSession(USER_ID, 'business', 'asaas', 'boleto');

      expect(result).toMatchObject({
        gateway: 'asaas',
        billing_type: 'BOLETO',
        payment_method: 'boleto',
      });
      expect(mockAsaas.createSubscription).toHaveBeenCalledWith(
        expect.objectContaining({
          billingType: 'BOLETO',
          value: 299,
        }),
      );
    });

    it('should create Asaas checkout for pro tier with credit_card', async () => {
      mockAdmin.from.mockReturnValue(mockChain({ data: null, error: { code: 'PGRST116' } }));

      mockAsaasCustomer.findOrCreate.mockResolvedValue({
        id: 'cus_asaas_3', name: 'Card User', email: 'card@test.com', dateCreated: '2026-01-01',
      });

      mockAsaas.createSubscription.mockResolvedValue({
        id: 'sub_asaas_3',
        customer: 'cus_asaas_3',
        billingType: 'CREDIT_CARD',
        value: 79,
        nextDueDate: '2026-04-01',
        status: 'ACTIVE',
        cycle: 'MONTHLY',
      });

      const result = await subscriptionService.createCheckoutSession(USER_ID, 'pro', 'asaas', 'credit_card');

      expect(result).toMatchObject({
        billing_type: 'CREDIT_CARD',
        payment_method: 'credit_card',
      });
    });

    it('should throw ALREADY_SUBSCRIBED if user has active paid subscription', async () => {
      mockAdmin.from.mockReturnValue(
        mockChain({ data: { id: 'sub-1', status: 'active', tier: 'pro' }, error: null }),
      );

      await expect(
        subscriptionService.createCheckoutSession(USER_ID, 'pro', 'asaas', 'pix'),
      ).rejects.toMatchObject({ code: 'ALREADY_SUBSCRIBED', statusCode: 409 });
    });

    it('should throw INVALID_TIER for invalid tier with asaas', async () => {
      mockAdmin.from.mockReturnValue(mockChain({ data: null, error: { code: 'PGRST116' } }));

      mockAsaasCustomer.findOrCreate.mockResolvedValue({
        id: 'cus_asaas_x', name: 'Test', email: 'test@test.com', dateCreated: '2026-01-01',
      });

      await expect(
        subscriptionService.createCheckoutSession(USER_ID, 'invalid', 'asaas', 'pix'),
      ).rejects.toMatchObject({ code: 'INVALID_TIER', statusCode: 400 });
    });
  });

  describe('activateSubscription with paymentGateway param', () => {
    it('should use asaas as payment_gateway when specified', async () => {
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
        'cus_asaas_1',
        'sub_asaas_1',
        '2026-01-01T00:00:00Z',
        '2026-02-01T00:00:00Z',
        'asaas',
      );

      expect(updateChain.update).toHaveBeenCalledWith(
        expect.objectContaining({
          payment_gateway: 'asaas',
          gateway_customer_id: 'cus_asaas_1',
          gateway_subscription_id: 'sub_asaas_1',
        }),
      );
    });

    it('should default to stripe when paymentGateway not specified', async () => {
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
        'cus_stripe',
        'sub_stripe',
        '2026-01-01T00:00:00Z',
        '2026-02-01T00:00:00Z',
      );

      expect(updateChain.update).toHaveBeenCalledWith(
        expect.objectContaining({ payment_gateway: 'stripe' }),
      );
    });
  });
});
