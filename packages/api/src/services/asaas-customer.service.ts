import { asaasClient } from '../lib/asaas';
import { supabaseAdmin } from '../lib/supabase';
import { logger } from '../lib/logger';
import { AppError } from '../lib/errors';
import type { AsaasCustomer } from '@decorai/shared';

export const asaasCustomerService = {
  async findOrCreate(userId: string): Promise<AsaasCustomer> {
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.getUserById(userId);

    if (authError || !authData?.user) {
      logger.error({ err: authError, userId }, 'Failed to fetch user for Asaas customer');
      throw new AppError({
        code: 'USER_NOT_FOUND',
        message: 'Usuario nao encontrado',
        statusCode: 404,
      });
    }

    const email = authData.user.email ?? '';
    if (!email) {
      throw new AppError({
        code: 'USER_EMAIL_MISSING',
        message: 'Email do usuario nao encontrado',
        statusCode: 400,
      });
    }

    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('display_name')
      .eq('id', userId)
      .single();

    const displayName = profile?.display_name || email;

    const existing = await asaasClient.findCustomerByEmail(email);
    if (existing) {
      logger.info({ customerId: existing.id, userId }, 'Found existing Asaas customer');
      return existing;
    }

    const customer = await asaasClient.createCustomer({
      name: displayName,
      email,
    });

    logger.info({ customerId: customer.id, userId }, 'Created new Asaas customer');
    return customer;
  },
};
