import { describe, it, expect, vi, beforeEach } from 'vitest';

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

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

import { asaasClient } from '../lib/asaas';

describe('asaasClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createCustomer', () => {
    it('should create a customer via POST /v3/customers', async () => {
      const mockCustomer = { id: 'cus_asaas_123', name: 'Test User', email: 'test@example.com', dateCreated: '2026-01-01' };
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockCustomer),
      });

      const result = await asaasClient.createCustomer({ name: 'Test User', email: 'test@example.com' });

      expect(result).toEqual(mockCustomer);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://sandbox.asaas.com/api/v3/customers',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({ access_token: 'test-asaas-key' }),
          body: JSON.stringify({ name: 'Test User', email: 'test@example.com' }),
        }),
      );
    });
  });

  describe('findCustomerByEmail', () => {
    it('should find existing customer', async () => {
      const mockCustomer = { id: 'cus_existing', name: 'Existing', email: 'existing@test.com', dateCreated: '2026-01-01' };
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: [mockCustomer] }),
      });

      const result = await asaasClient.findCustomerByEmail('existing@test.com');

      expect(result).toEqual(mockCustomer);
    });

    it('should return null when no customer found', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: [] }),
      });

      const result = await asaasClient.findCustomerByEmail('notfound@test.com');

      expect(result).toBeNull();
    });
  });

  describe('createSubscription', () => {
    it('should create a subscription via POST /v3/subscriptions', async () => {
      const mockSub = { id: 'sub_asaas_1', customer: 'cus_1', billingType: 'PIX', value: 79, status: 'ACTIVE' };
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockSub),
      });

      const result = await asaasClient.createSubscription({
        customer: 'cus_1',
        billingType: 'PIX',
        value: 79,
        nextDueDate: '2026-04-01',
        cycle: 'MONTHLY',
        description: 'DecorAI Pro - PIX',
        externalReference: 'user-123',
      });

      expect(result).toEqual(mockSub);
    });
  });

  describe('error handling', () => {
    it('should throw AppError on 4xx responses', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        text: () => Promise.resolve('Bad request'),
      });

      await expect(asaasClient.createCustomer({ name: 'Test', email: 'test@test.com' }))
        .rejects.toMatchObject({ code: 'ASAAS_API_ERROR', statusCode: 400 });
    });

    it('should retry on 5xx errors and then throw', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        text: () => Promise.resolve('Internal error'),
      });

      await expect(asaasClient.createCustomer({ name: 'Test', email: 'test@test.com' }))
        .rejects.toMatchObject({ code: 'ASAAS_API_ERROR', statusCode: 502 });

      // 1 initial + 2 retries = 3 calls
      expect(mockFetch).toHaveBeenCalledTimes(3);
    });

    it('should retry on network errors', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      await expect(asaasClient.createCustomer({ name: 'Test', email: 'test@test.com' }))
        .rejects.toMatchObject({ code: 'ASAAS_CONNECTION_ERROR', statusCode: 502 });

      expect(mockFetch).toHaveBeenCalledTimes(3);
    });
  });

  describe('getSubscription', () => {
    it('should retrieve subscription by ID', async () => {
      const mockSub = { id: 'sub_1', customer: 'cus_1', status: 'ACTIVE' };
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockSub),
      });

      const result = await asaasClient.getSubscription('sub_1');

      expect(result).toEqual(mockSub);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://sandbox.asaas.com/api/v3/subscriptions/sub_1',
        expect.objectContaining({ method: 'GET' }),
      );
    });
  });

  describe('cancelSubscription', () => {
    it('should cancel subscription via DELETE', async () => {
      const mockSub = { id: 'sub_1', status: 'INACTIVE' };
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockSub),
      });

      const result = await asaasClient.cancelSubscription('sub_1');

      expect(result).toEqual(mockSub);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://sandbox.asaas.com/api/v3/subscriptions/sub_1',
        expect.objectContaining({ method: 'DELETE' }),
      );
    });
  });
});
