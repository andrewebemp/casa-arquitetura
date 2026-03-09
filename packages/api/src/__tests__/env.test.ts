import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('env config', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should fail fast when required env vars are missing', async () => {
    process.env = { PATH: process.env.PATH };

    await expect(async () => {
      await import('../config/env');
    }).rejects.toThrow();
  });

  it('should load valid configuration successfully', async () => {
    process.env.SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_ANON_KEY = 'test-anon-key';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';
    process.env.REDIS_URL = 'redis://localhost:6379';
    process.env.PORT = '4000';
    process.env.NODE_ENV = 'test';
    process.env.CORS_ORIGINS = 'http://localhost:3000';
    process.env.STRIPE_SECRET_KEY = 'sk_test_xxx';
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_xxx';
    process.env.STRIPE_PRO_PRICE_ID = 'price_pro';
    process.env.STRIPE_BUSINESS_PRICE_ID = 'price_business';
    process.env.OPENROUTER_API_KEY = 'sk-or-test-key';

    const { env } = await import('../config/env');

    expect(env.SUPABASE_URL).toBe('https://test.supabase.co');
    expect(env.SUPABASE_ANON_KEY).toBe('test-anon-key');
    expect(env.SUPABASE_SERVICE_ROLE_KEY).toBe('test-service-key');
    expect(env.REDIS_URL).toBe('redis://localhost:6379');
    expect(env.PORT).toBe(4000);
    expect(env.NODE_ENV).toBe('test');
    expect(env.CORS_ORIGINS).toBe('http://localhost:3000');
    expect(env.STRIPE_SECRET_KEY).toBe('sk_test_xxx');
    expect(env.STRIPE_WEBHOOK_SECRET).toBe('whsec_xxx');
    expect(env.STRIPE_PRO_PRICE_ID).toBe('price_pro');
    expect(env.STRIPE_BUSINESS_PRICE_ID).toBe('price_business');
    expect(env.OPENROUTER_API_KEY).toBe('sk-or-test-key');
  });
});
