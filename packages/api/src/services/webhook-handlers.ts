import Stripe from 'stripe';
import { supabaseAdmin } from '../lib/supabase';
import { logger } from '../lib/logger';
import { subscriptionService } from './subscription.service';
import type { SubscriptionTier } from '@decorai/shared';

async function isEventProcessed(eventId: string): Promise<boolean> {
  const { data } = await supabaseAdmin
    .from('webhook_events')
    .select('id')
    .eq('event_id', eventId)
    .single();

  return !!data;
}

async function markEventProcessed(eventId: string, eventType: string): Promise<void> {
  await supabaseAdmin
    .from('webhook_events')
    .insert({ event_id: eventId, event_type: eventType, processed_at: new Date().toISOString() });
}

function toISOString(timestamp: number): string {
  return new Date(timestamp * 1000).toISOString();
}

export async function handleCheckoutCompleted(event: Stripe.Event): Promise<void> {
  if (await isEventProcessed(event.id)) {
    logger.info({ eventId: event.id }, 'Webhook event already processed, skipping');
    return;
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const userId = session.metadata?.user_id ?? session.client_reference_id;
  const tier = (session.metadata?.tier ?? 'pro') as SubscriptionTier;

  if (!userId) {
    logger.error({ eventId: event.id }, 'Missing user_id in checkout session metadata');
    return;
  }

  const subscriptionId = typeof session.subscription === 'string'
    ? session.subscription
    : session.subscription?.id ?? '';

  const customerId = typeof session.customer === 'string'
    ? session.customer
    : session.customer?.id ?? '';

  const stripeSubscription = await getStripeSubscription(subscriptionId);
  const periodStart = stripeSubscription
    ? toISOString(stripeSubscription.current_period_start)
    : new Date().toISOString();
  const periodEnd = stripeSubscription
    ? toISOString(stripeSubscription.current_period_end)
    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  await subscriptionService.activateSubscription(
    userId,
    tier,
    customerId,
    subscriptionId,
    periodStart,
    periodEnd,
  );

  await markEventProcessed(event.id, event.type);
  logger.info({ userId, tier, eventId: event.id }, 'Checkout completed — subscription activated');
}

export async function handleInvoicePaid(event: Stripe.Event): Promise<void> {
  if (await isEventProcessed(event.id)) {
    logger.info({ eventId: event.id }, 'Webhook event already processed, skipping');
    return;
  }

  const invoice = event.data.object as Stripe.Invoice;
  const customerId = typeof invoice.customer === 'string'
    ? invoice.customer
    : invoice.customer?.id ?? '';

  const userId = await findUserByCustomerId(customerId);
  if (!userId) {
    logger.error({ customerId, eventId: event.id }, 'No user found for Stripe customer');
    return;
  }

  const subscriptionId = typeof invoice.subscription === 'string'
    ? invoice.subscription
    : invoice.subscription?.id ?? '';

  const stripeSubscription = await getStripeSubscription(subscriptionId);
  if (stripeSubscription) {
    await subscriptionService.renewSubscription(
      userId,
      toISOString(stripeSubscription.current_period_start),
      toISOString(stripeSubscription.current_period_end),
    );
  }

  await markEventProcessed(event.id, event.type);
  logger.info({ userId, eventId: event.id }, 'Invoice paid — subscription renewed');
}

export async function handleInvoicePaymentFailed(event: Stripe.Event): Promise<void> {
  if (await isEventProcessed(event.id)) {
    logger.info({ eventId: event.id }, 'Webhook event already processed, skipping');
    return;
  }

  const invoice = event.data.object as Stripe.Invoice;
  const customerId = typeof invoice.customer === 'string'
    ? invoice.customer
    : invoice.customer?.id ?? '';

  const userId = await findUserByCustomerId(customerId);
  if (!userId) {
    logger.error({ customerId, eventId: event.id }, 'No user found for Stripe customer');
    return;
  }

  await subscriptionService.markPastDue(userId);

  await markEventProcessed(event.id, event.type);
  logger.info({ userId, eventId: event.id }, 'Payment failed — subscription marked past_due');
}

export async function handleSubscriptionDeleted(event: Stripe.Event): Promise<void> {
  if (await isEventProcessed(event.id)) {
    logger.info({ eventId: event.id }, 'Webhook event already processed, skipping');
    return;
  }

  const subscription = event.data.object as Stripe.Subscription;
  const customerId = typeof subscription.customer === 'string'
    ? subscription.customer
    : subscription.customer?.id ?? '';

  const userId = await findUserByCustomerId(customerId);
  if (!userId) {
    logger.error({ customerId, eventId: event.id }, 'No user found for Stripe customer');
    return;
  }

  await subscriptionService.downgradeToFree(userId);

  await markEventProcessed(event.id, event.type);
  logger.info({ userId, eventId: event.id }, 'Subscription deleted — downgraded to free');
}

async function findUserByCustomerId(customerId: string): Promise<string | null> {
  const { data } = await supabaseAdmin
    .from('subscriptions')
    .select('user_id')
    .eq('gateway_customer_id', customerId)
    .single();

  return data?.user_id ?? null;
}

async function getStripeSubscription(subscriptionId: string): Promise<Stripe.Subscription | null> {
  if (!subscriptionId) return null;
  try {
    const { stripe } = await import('../lib/stripe');
    return await stripe.subscriptions.retrieve(subscriptionId);
  } catch {
    logger.error({ subscriptionId }, 'Failed to retrieve Stripe subscription');
    return null;
  }
}
