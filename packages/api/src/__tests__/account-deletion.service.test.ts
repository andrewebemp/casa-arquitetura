import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../lib/supabase', () => ({
  supabaseAdmin: {
    from: vi.fn(),
  },
}));

vi.mock('../lib/stripe', () => ({
  stripe: {
    subscriptions: {
      cancel: vi.fn(),
    },
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
    STRIPE_SECRET_KEY: 'sk_test_123',
    STRIPE_WEBHOOK_SECRET: 'whsec_test',
    STRIPE_PRO_PRICE_ID: 'price_pro',
    STRIPE_BUSINESS_PRICE_ID: 'price_biz',
    ANTHROPIC_API_KEY: 'sk-ant-test',
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

import { accountDeletionService } from '../services/account-deletion.service';
import { supabaseAdmin } from '../lib/supabase';
import { stripe } from '../lib/stripe';
import { AppError } from '../lib/errors';

const mockFrom = vi.mocked(supabaseAdmin.from);
const mockStripeCancel = vi.mocked(stripe.subscriptions.cancel);

describe('accountDeletionService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('softDeleteAccount', () => {
    it('should soft-delete account and cancel Stripe subscription', async () => {
      let callCount = 0;
      mockFrom.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          // subscriptions select
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: {
                    gateway_subscription_id: 'sub_123',
                    gateway_customer_id: 'cus_123',
                  },
                  error: null,
                }),
              }),
            }),
          } as never;
        }
        if (callCount === 2) {
          // subscriptions update
          return {
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ data: null, error: null }),
            }),
          } as never;
        }
        if (callCount === 3) {
          // user_profiles update (soft-delete)
          return {
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ data: null, error: null }),
            }),
          } as never;
        }
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        } as never;
      });

      mockStripeCancel.mockResolvedValue({} as never);

      const result = await accountDeletionService.softDeleteAccount('user-123');

      expect(result.deleted_at).toBeDefined();
      expect(result.cleanup_scheduled_at).toBeDefined();
      expect(result.message).toContain('exclusao');
      expect(mockStripeCancel).toHaveBeenCalledWith('sub_123');
    });

    it('should throw ACCOUNT_DELETION_FAILED on profile update error', async () => {
      let callCount = 0;
      mockFrom.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          // subscriptions select - no subscription
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: null, error: null }),
              }),
            }),
          } as never;
        }
        if (callCount === 2) {
          // subscriptions update
          return {
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ data: null, error: null }),
            }),
          } as never;
        }
        if (callCount === 3) {
          // user_profiles update - ERROR
          return {
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ data: null, error: { message: 'update failed' } }),
            }),
          } as never;
        }
        return {} as never;
      });

      try {
        await accountDeletionService.softDeleteAccount('user-123');
        expect.fail('should have thrown');
      } catch (err) {
        expect(err).toBeInstanceOf(AppError);
        expect(err).toMatchObject({ code: 'ACCOUNT_DELETION_FAILED' });
      }
    });
  });
});
