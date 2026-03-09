import { stripe } from '../lib/stripe';
import { supabaseAdmin } from '../lib/supabase';
import { AppError } from '../lib/errors';
import { logger } from '../lib/logger';
import { env } from '../config/env';
import { TIER_LIMITS, BILLING_TYPE_MAP } from '@decorai/shared';
import type { Database, SubscriptionTier, PaymentGateway, AsaasPaymentMethod } from '@decorai/shared';
import { asaasCustomerService } from './asaas-customer.service';
import { asaasClient } from '../lib/asaas';

type SubscriptionRow = Database['public']['Tables']['subscriptions']['Row'];

const PRICE_IDS: Record<string, string> = {
  pro: env.STRIPE_PRO_PRICE_ID,
  business: env.STRIPE_BUSINESS_PRICE_ID,
};

const ASAAS_VALUES: Record<string, string> = {
  pro: env.ASAAS_PRO_VALUE,
  business: env.ASAAS_BUSINESS_VALUE,
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

  async createCheckoutSession(
    userId: string,
    tier: string,
    gateway: string = 'stripe',
    paymentMethod?: string,
  ) {
    const existing = await this.getByUserId(userId);
    if (existing && existing.status === 'active' && existing.tier !== 'free') {
      throw new AppError({
        code: 'ALREADY_SUBSCRIBED',
        message: 'Usuario ja possui uma assinatura ativa',
        statusCode: 409,
      });
    }

    if (gateway === 'asaas') {
      return this.createAsaasCheckout(userId, tier, paymentMethod as AsaasPaymentMethod);
    }

    return this.createStripeCheckout(userId, tier);
  },

  async createStripeCheckout(userId: string, tier: string) {
    const priceId = PRICE_IDS[tier];
    if (!priceId) {
      throw new AppError({
        code: 'INVALID_TIER',
        message: `Tier invalido: ${tier}`,
        statusCode: 400,
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

  async createAsaasCheckout(userId: string, tier: string, paymentMethod: AsaasPaymentMethod) {
    const value = ASAAS_VALUES[tier];
    if (!value) {
      throw new AppError({
        code: 'INVALID_TIER',
        message: `Tier invalido: ${tier}`,
        statusCode: 400,
      });
    }

    const customer = await asaasCustomerService.findOrCreate(userId);
    const billingType = BILLING_TYPE_MAP[paymentMethod];

    const nextDueDate = new Date();
    nextDueDate.setDate(nextDueDate.getDate() + 1);

    const subscription = await asaasClient.createSubscription({
      customer: customer.id,
      billingType,
      value: parseFloat(value),
      nextDueDate: nextDueDate.toISOString().split('T')[0],
      cycle: 'MONTHLY',
      description: `DecorAI ${tier.charAt(0).toUpperCase() + tier.slice(1)} - ${billingType}`,
      externalReference: userId,
    });

    logger.info({ userId, tier, subscriptionId: subscription.id, paymentMethod }, 'Asaas subscription created');

    return {
      checkout_url: null,
      gateway: 'asaas' as const,
      subscription_id: subscription.id,
      customer_id: customer.id,
      billing_type: billingType,
      payment_method: paymentMethod,
    };
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
    paymentGateway: PaymentGateway = 'stripe',
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
          payment_gateway: paymentGateway,
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
          payment_gateway: paymentGateway,
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
