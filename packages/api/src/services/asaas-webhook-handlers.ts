import { supabaseAdmin } from '../lib/supabase';
import { logger } from '../lib/logger';
import { subscriptionService } from './subscription.service';
import type { AsaasWebhookPayload, SubscriptionTier } from '@decorai/shared';

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

function deriveEventId(payload: AsaasWebhookPayload): string {
  const paymentId = payload.payment?.id ?? '';
  const subscriptionId = payload.subscription?.id ?? '';
  return `asaas_${payload.event}_${paymentId || subscriptionId}`;
}

async function findUserByAsaasCustomerId(customerId: string): Promise<string | null> {
  const { data } = await supabaseAdmin
    .from('subscriptions')
    .select('user_id')
    .eq('gateway_customer_id', customerId)
    .eq('payment_gateway', 'asaas')
    .single();

  return data?.user_id ?? null;
}

function resolveTierFromValue(value: number): SubscriptionTier {
  if (value >= 299) return 'business';
  return 'pro';
}

export async function handleAsaasPaymentConfirmed(payload: AsaasWebhookPayload): Promise<void> {
  const eventId = deriveEventId(payload);

  if (await isEventProcessed(eventId)) {
    logger.info({ eventId }, 'Asaas webhook event already processed, skipping');
    return;
  }

  const payment = payload.payment;
  if (!payment) {
    logger.error({ eventId }, 'PAYMENT_CONFIRMED without payment data');
    return;
  }

  const userId = await findUserByAsaasCustomerId(payment.customer);
  if (!userId) {
    logger.error({ customerId: payment.customer, eventId }, 'No user found for Asaas customer');
    return;
  }

  const tier = resolveTierFromValue(payment.value);
  const now = new Date();
  const periodEnd = new Date(now);
  periodEnd.setMonth(periodEnd.getMonth() + 1);

  await subscriptionService.activateSubscription(
    userId,
    tier,
    payment.customer,
    payment.subscription ?? payment.id,
    now.toISOString(),
    periodEnd.toISOString(),
    'asaas',
  );

  await markEventProcessed(eventId, 'PAYMENT_CONFIRMED');
  logger.info({ userId, tier, eventId }, 'Asaas payment confirmed — subscription activated');
}

export async function handleAsaasPaymentReceived(payload: AsaasWebhookPayload): Promise<void> {
  const eventId = deriveEventId(payload);

  if (await isEventProcessed(eventId)) {
    logger.info({ eventId }, 'Asaas webhook event already processed, skipping');
    return;
  }

  const payment = payload.payment;
  if (!payment) {
    logger.error({ eventId }, 'PAYMENT_RECEIVED without payment data');
    return;
  }

  const userId = await findUserByAsaasCustomerId(payment.customer);
  if (!userId) {
    logger.error({ customerId: payment.customer, eventId }, 'No user found for Asaas customer');
    return;
  }

  const now = new Date();
  const periodEnd = new Date(now);
  periodEnd.setMonth(periodEnd.getMonth() + 1);

  await subscriptionService.renewSubscription(userId, now.toISOString(), periodEnd.toISOString());

  await markEventProcessed(eventId, 'PAYMENT_RECEIVED');
  logger.info({ userId, eventId }, 'Asaas payment received — subscription renewed');
}

export async function handleAsaasPaymentOverdue(payload: AsaasWebhookPayload): Promise<void> {
  const eventId = deriveEventId(payload);

  if (await isEventProcessed(eventId)) {
    logger.info({ eventId }, 'Asaas webhook event already processed, skipping');
    return;
  }

  const payment = payload.payment;
  if (!payment) {
    logger.error({ eventId }, 'PAYMENT_OVERDUE without payment data');
    return;
  }

  const userId = await findUserByAsaasCustomerId(payment.customer);
  if (!userId) {
    logger.error({ customerId: payment.customer, eventId }, 'No user found for Asaas customer');
    return;
  }

  await subscriptionService.markPastDue(userId);

  await markEventProcessed(eventId, 'PAYMENT_OVERDUE');
  logger.info({ userId, eventId }, 'Asaas payment overdue — subscription marked past_due');
}

export async function handleAsaasSubscriptionDeleted(payload: AsaasWebhookPayload): Promise<void> {
  const eventId = deriveEventId(payload);

  if (await isEventProcessed(eventId)) {
    logger.info({ eventId }, 'Asaas webhook event already processed, skipping');
    return;
  }

  const subscription = payload.subscription;
  if (!subscription) {
    logger.error({ eventId }, 'SUBSCRIPTION_DELETED without subscription data');
    return;
  }

  const userId = await findUserByAsaasCustomerId(subscription.customer);
  if (!userId) {
    logger.error({ customerId: subscription.customer, eventId }, 'No user found for Asaas customer');
    return;
  }

  await subscriptionService.downgradeToFree(userId);

  await markEventProcessed(eventId, 'SUBSCRIPTION_DELETED');
  logger.info({ userId, eventId }, 'Asaas subscription deleted — downgraded to free');
}
