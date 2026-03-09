import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../config/env', () => ({
  env: {
    ASAAS_API_KEY: 'test-asaas-key',
    ASAAS_API_URL: 'https://sandbox.asaas.com/api',
    ASAAS_WEBHOOK_TOKEN: 'valid-webhook-token',
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

vi.mock('../services/asaas-webhook-handlers', () => ({
  handleAsaasPaymentConfirmed: vi.fn(),
  handleAsaasPaymentReceived: vi.fn(),
  handleAsaasPaymentOverdue: vi.fn(),
  handleAsaasSubscriptionDeleted: vi.fn(),
}));

import Fastify from 'fastify';
import { asaasWebhookRoutes } from '../routes/asaas-webhook.routes';
import {
  handleAsaasPaymentConfirmed,
  handleAsaasPaymentReceived,
  handleAsaasPaymentOverdue,
  handleAsaasSubscriptionDeleted,
} from '../services/asaas-webhook-handlers';

describe('asaasWebhookRoutes', () => {
  let server: ReturnType<typeof Fastify>;

  beforeEach(async () => {
    vi.clearAllMocks();
    server = Fastify();
    await server.register(asaasWebhookRoutes, { prefix: '/webhooks' });
    await server.ready();
  });

  it('should reject requests without access token', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/webhooks/asaas',
      payload: { event: 'PAYMENT_CONFIRMED' },
    });

    expect(response.statusCode).toBe(400);
    const body = JSON.parse(response.payload);
    expect(body.error.code).toBe('INVALID_TOKEN');
  });

  it('should reject requests with invalid access token', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/webhooks/asaas',
      headers: { 'asaas-access-token': 'wrong-token' },
      payload: { event: 'PAYMENT_CONFIRMED' },
    });

    expect(response.statusCode).toBe(400);
  });

  it('should accept and process PAYMENT_CONFIRMED event', async () => {
    const payload = {
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

    const response = await server.inject({
      method: 'POST',
      url: '/webhooks/asaas',
      headers: { 'asaas-access-token': 'valid-webhook-token' },
      payload,
    });

    expect(response.statusCode).toBe(200);
    expect(handleAsaasPaymentConfirmed).toHaveBeenCalled();
  });

  it('should accept and process PAYMENT_RECEIVED event', async () => {
    const payload = {
      event: 'PAYMENT_RECEIVED',
      payment: {
        id: 'pay_456',
        customer: 'cus_123',
        billingType: 'BOLETO',
        value: 79.00,
        status: 'RECEIVED',
        dueDate: '2026-04-10',
      },
    };

    const response = await server.inject({
      method: 'POST',
      url: '/webhooks/asaas',
      headers: { 'asaas-access-token': 'valid-webhook-token' },
      payload,
    });

    expect(response.statusCode).toBe(200);
    expect(handleAsaasPaymentReceived).toHaveBeenCalled();
  });

  it('should accept and process PAYMENT_OVERDUE event', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/webhooks/asaas',
      headers: { 'asaas-access-token': 'valid-webhook-token' },
      payload: {
        event: 'PAYMENT_OVERDUE',
        payment: { id: 'pay_789', customer: 'cus_123', billingType: 'PIX', value: 79, status: 'OVERDUE', dueDate: '2026-03-10' },
      },
    });

    expect(response.statusCode).toBe(200);
    expect(handleAsaasPaymentOverdue).toHaveBeenCalled();
  });

  it('should accept and process SUBSCRIPTION_DELETED event', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/webhooks/asaas',
      headers: { 'asaas-access-token': 'valid-webhook-token' },
      payload: {
        event: 'SUBSCRIPTION_DELETED',
        subscription: { id: 'sub_123', customer: 'cus_123', billingType: 'PIX', value: 79, nextDueDate: '2026-04-10', status: 'INACTIVE', cycle: 'MONTHLY' },
      },
    });

    expect(response.statusCode).toBe(200);
    expect(handleAsaasSubscriptionDeleted).toHaveBeenCalled();
  });

  it('should return 200 for unhandled events', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/webhooks/asaas',
      headers: { 'asaas-access-token': 'valid-webhook-token' },
      payload: { event: 'SUBSCRIPTION_UPDATED' },
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.payload);
    expect(body.received).toBe(true);
  });

  it('should return 500 when handler throws', async () => {
    vi.mocked(handleAsaasPaymentConfirmed).mockRejectedValueOnce(new Error('DB error'));

    const response = await server.inject({
      method: 'POST',
      url: '/webhooks/asaas',
      headers: { 'asaas-access-token': 'valid-webhook-token' },
      payload: {
        event: 'PAYMENT_CONFIRMED',
        payment: { id: 'pay_err', customer: 'cus_123', billingType: 'PIX', value: 79, status: 'CONFIRMED', dueDate: '2026-03-10' },
      },
    });

    expect(response.statusCode).toBe(500);
  });
});
