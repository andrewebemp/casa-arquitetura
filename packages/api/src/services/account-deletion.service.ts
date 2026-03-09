import { supabaseAdmin } from '../lib/supabase';
import { stripe } from '../lib/stripe';
import { AppError } from '../lib/errors';
import { logger } from '../lib/logger';

export const accountDeletionService = {
  async softDeleteAccount(userId: string) {
    const now = new Date().toISOString();

    // 1. Cancel Stripe subscription if active
    const { data: subscription } = await supabaseAdmin
      .from('subscriptions')
      .select('gateway_subscription_id, gateway_customer_id')
      .eq('user_id', userId)
      .single();

    if (subscription?.gateway_subscription_id) {
      try {
        await stripe.subscriptions.cancel(subscription.gateway_subscription_id);
        logger.info({ userId }, 'Stripe subscription canceled for account deletion');
      } catch (err) {
        logger.error({ err, userId }, 'Failed to cancel Stripe subscription during deletion');
      }
    }

    // 2. Update subscription to canceled
    await supabaseAdmin
      .from('subscriptions')
      .update({
        status: 'canceled',
        updated_at: now,
      })
      .eq('user_id', userId);

    // 3. Soft-delete profile (mark deleted_at, keep data for 30 days)
    const { error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .update({
        deleted_at: now,
        lgpd_consent_at: null,
        lgpd_consent_version: null,
        training_opt_in: false,
        updated_at: now,
      })
      .eq('id', userId);

    if (profileError) {
      logger.error({ err: profileError, userId }, 'Failed to soft-delete profile');
      throw new AppError({
        code: 'ACCOUNT_DELETION_FAILED',
        message: 'Falha ao excluir conta',
        statusCode: 500,
      });
    }

    logger.info({ userId }, 'Account soft-deleted, scheduled for cleanup in 30 days');

    return {
      deleted_at: now,
      cleanup_scheduled_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      message: 'Conta marcada para exclusao. Seus dados serao removidos em ate 30 dias.',
    };
  },
};
