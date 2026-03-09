import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../lib/asaas', () => ({
  asaasClient: {
    findCustomerByEmail: vi.fn(),
    createCustomer: vi.fn(),
  },
}));

const { mockGetUserById } = vi.hoisted(() => ({
  mockGetUserById: vi.fn(),
}));

vi.mock('../lib/supabase', () => ({
  supabaseAdmin: {
    from: vi.fn(),
    auth: { admin: { getUserById: mockGetUserById } },
  },
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

import { asaasCustomerService } from '../services/asaas-customer.service';
import { supabaseAdmin } from '../lib/supabase';
import { asaasClient } from '../lib/asaas';

const mockAdmin = supabaseAdmin as unknown as {
  from: ReturnType<typeof vi.fn>;
  auth: { admin: { getUserById: ReturnType<typeof vi.fn> } };
};
const mockAsaas = vi.mocked(asaasClient);

function mockChain(result: { data?: unknown; error?: unknown }) {
  const chain: Record<string, unknown> = {};
  chain.select = vi.fn().mockReturnValue(chain);
  chain.eq = vi.fn().mockReturnValue(chain);
  chain.single = vi.fn().mockResolvedValue(result);
  return chain;
}

describe('asaasCustomerService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('findOrCreate', () => {
    it('should return existing customer when found by email', async () => {
      mockGetUserById.mockResolvedValue({
        data: { user: { id: 'user-123', email: 'jose@test.com' } },
        error: null,
      });
      mockAdmin.from.mockReturnValue(
        mockChain({ data: { display_name: 'Jose Silva' }, error: null }),
      );

      const existingCustomer = { id: 'cus_existing', name: 'Jose Silva', email: 'jose@test.com', dateCreated: '2026-01-01' };
      mockAsaas.findCustomerByEmail.mockResolvedValue(existingCustomer);

      const result = await asaasCustomerService.findOrCreate('user-123');

      expect(result).toEqual(existingCustomer);
      expect(mockAsaas.createCustomer).not.toHaveBeenCalled();
    });

    it('should create new customer when not found', async () => {
      mockGetUserById.mockResolvedValue({
        data: { user: { id: 'user-456', email: 'maria@test.com' } },
        error: null,
      });
      mockAdmin.from.mockReturnValue(
        mockChain({ data: { display_name: 'Maria Santos' }, error: null }),
      );

      mockAsaas.findCustomerByEmail.mockResolvedValue(null);

      const newCustomer = { id: 'cus_new', name: 'Maria Santos', email: 'maria@test.com', dateCreated: '2026-03-09' };
      mockAsaas.createCustomer.mockResolvedValue(newCustomer);

      const result = await asaasCustomerService.findOrCreate('user-456');

      expect(result).toEqual(newCustomer);
      expect(mockAsaas.createCustomer).toHaveBeenCalledWith({
        name: 'Maria Santos',
        email: 'maria@test.com',
      });
    });

    it('should use email as name when display_name is missing', async () => {
      mockGetUserById.mockResolvedValue({
        data: { user: { id: 'user-789', email: 'noname@test.com' } },
        error: null,
      });
      mockAdmin.from.mockReturnValue(
        mockChain({ data: { display_name: null }, error: null }),
      );

      mockAsaas.findCustomerByEmail.mockResolvedValue(null);

      const newCustomer = { id: 'cus_noname', name: 'noname@test.com', email: 'noname@test.com', dateCreated: '2026-03-09' };
      mockAsaas.createCustomer.mockResolvedValue(newCustomer);

      await asaasCustomerService.findOrCreate('user-789');

      expect(mockAsaas.createCustomer).toHaveBeenCalledWith({
        name: 'noname@test.com',
        email: 'noname@test.com',
      });
    });

    it('should throw when user not found in auth', async () => {
      mockGetUserById.mockResolvedValue({
        data: { user: null },
        error: { message: 'User not found' },
      });

      await expect(asaasCustomerService.findOrCreate('user-notfound'))
        .rejects.toMatchObject({ code: 'USER_NOT_FOUND', statusCode: 404 });
    });

    it('should throw when user has no email', async () => {
      mockGetUserById.mockResolvedValue({
        data: { user: { id: 'user-noemail', email: null } },
        error: null,
      });

      await expect(asaasCustomerService.findOrCreate('user-noemail'))
        .rejects.toMatchObject({ code: 'USER_EMAIL_MISSING', statusCode: 400 });
    });
  });
});
