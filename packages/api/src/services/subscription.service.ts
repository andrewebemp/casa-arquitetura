import { stripe } from '../lib/stripe';
import { supabaseAdmin } from '../lib/supabase';
import { AppError } from '../lib/errors';
import { logger } from '../lib/logger';
import { env } from '../config/env';
import { TIER_LIMITS } from '@decorai/shared';
import type { Database, SubscriptionTier } from '@decorai/shared';

type SubscriptionRow = Database['public']['Tables']['subscriptions']['Row'];

const PRICE_IDS: Record<string, string> = {
  pro: env.STRIPE_PRO_PRICE_ID,
  business: env.STRIPE_BUSINESS_PRICE_ID,
};

const GRACE_PERIOD_DAYS = 3;

export const subscriptionService = {
  async getByUserId(userId: string): Promise<SubscriptionRow | null> {
    const { data, error } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      return null;
    }

    return data as SubscriptionRow;
  },

  async createCheckoutSession(userId: string, tier: string) {
    const priceId = PRICE_IDS[tier];
    if (!priceId) {
      throw new AppError({
        code: 'INVALID_TIER',
        message: `Tier invalido: ${tier}`,
        statusCode: 400,
      });
    }

    const existing = await this.getByUserId(userId);
    if (existing && existing.status === 'active' && existing.tier !== 'free') {
      throw new AppError({
        code: 'ALREADY_SUBSCRIBED',
        message: 'Usuario ja possui uma assinatura ativa',
        statusCode: 409,
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${env.CORS_ORIGINS.split(',')[0]}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.CORS_ORIGINS.split(',')[0]}/subscription/cancel`,
      metadata: { user_id: userId, tier },
      client_reference_id: userId,
    });

    return { checkout_url: session.url };
  },

  async createPortalSession(userId: string) {
    const subscription = await this.getByUserId(userId);

    if (!subscription || !subscription.gateway_customer_id) {
      throw new AppError({
        code: 'NO_SUBSCRIPTION',
        message: 'Nenhuma assinatura encontrada para este usuario',
        statusCode: 404,
      });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.gateway_customer_id,
      return_url: `${env.CORS_ORIGINS.split(',')[0]}/subscription`,
    });

    return { portal_url: session.url };
  },

  async activateSubscription(
    userId: string,
    tier: SubscriptionTier,
    customerId: string,
    subscriptionId: string,
    periodStart: string,
    periodEnd: string,
  ) {
    const limits = TIER_LIMITS[tier];

    const { data: existing } = await supabaseAdmin
      .from('subscriptions')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (existing) {
      const { error } = await supabaseAdmin
        .from('subscriptions')
        .update({
          tier,
          status: 'active',
          payment_gateway: 'stripe',
          gateway_customer_id: customerId,
          gateway_subscription_id: subscriptionId,
          renders_used: 0,
          renders_limit: limits.renders_limit,
          current_period_start: periodStart,
          current_period_end: periodEnd,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (error) {
        logger.error({ err: error }, 'Failed to update subscription');
        throw new AppError({
          code: 'SUBSCRIPTION_UPDATE_FAILED',
          message: 'Falha ao atualizar assinatura',
          statusCode: 500,
        });
      }
    } else {
      const { error } = await supabaseAdmin
        .from('subscriptions')
        .insert({
          user_id: userId,
          tier,
          status: 'active',
          payment_gateway: 'stripe',
          gateway_customer_id: customerId,
          gateway_subscription_id: subscriptionId,
          renders_used: 0,
          renders_limit: limits.renders_limit,
          current_period_start: periodStart,
          current_period_end: periodEnd,
        });

      if (error) {
        logger.error({ err: error }, 'Failed to create subscription');
        throw new AppError({
          code: 'SUBSCRIPTION_CREATE_FAILED',
          message: 'Falha ao criar assinatura',
          statusCode: 500,
        });
      }
    }
  },

  async renewSubscription(userId: string, periodStart: string, periodEnd: string) {
    const { error } = await supabaseAdmin
      .from('subscriptions')
      .update({
        renders_used: 0,
        current_period_start: periodStart,
        current_period_end: periodEnd,
        status: 'active',
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (error) {
      logger.error({ err: error }, 'Failed to renew subscription');
      throw new AppError({
        code: 'SUBSCRIPTION_RENEW_FAILED',
        message: 'Falha ao renovar assinatura',
        statusCode: 500,
      });
    }
  },

  async markPastDue(userId: string) {
    const { error } = await supabaseAdmin
      .from('subscriptions')
      .update({
        status: 'past_due',
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (error) {
      logger.error({ err: error }, 'Failed to mark subscription as past_due');
    }
  },

  async downgradeToFree(userId: string) {
    const freeLimits = TIER_LIMITS.free;

    const { error } = await supabaseAdmin
      .from('subscriptions')
      .update({
        tier: 'free',
        status: 'canceled',
        renders_limit: freeLimits.renders_limit,
        gateway_subscription_id: null,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (error) {
      logger.error({ err: error }, 'Failed to downgrade subscription to free');
    }
  },

  getGracePeriodEnd(fromDate: Date): Date {
    const end = new Date(fromDate);
    end.setDate(end.getDate() + GRACE_PERIOD_DAYS);
    return end;
  },
};
