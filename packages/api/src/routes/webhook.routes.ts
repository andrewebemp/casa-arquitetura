import { FastifyInstance } from 'fastify';
import { stripe } from '../lib/stripe';
import { env } from '../config/env';
import { logger } from '../lib/logger';
import {
  handleCheckoutCompleted,
  handleInvoicePaid,
  handleInvoicePaymentFailed,
  handleSubscriptionDeleted,
} from '../services/webhook-handlers';

const HANDLED_EVENTS = new Set([
  'checkout.session.completed',
  'invoice.paid',
  'invoice.payment_failed',
  'customer.subscription.deleted',
]);

export async function webhookRoutes(server: FastifyInstance): Promise<void> {
  // Register raw body content type parser for webhook signature verification
  server.addContentTypeParser(
    'application/json',
    { parseAs: 'buffer' },
    (_req, body, done) => {
      done(null, body);
    },
  );

  // POST /webhooks/stripe - Stripe webhook endpoint
  server.post('/stripe', async (request, reply) => {
    const signature = request.headers['stripe-signature'] as string | undefined;

    if (!signature) {
      return reply.status(400).send({
        error: { code: 'MISSING_SIGNATURE', message: 'Stripe-Signature header ausente' },
      });
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(
        request.body as Buffer,
        signature,
        env.STRIPE_WEBHOOK_SECRET,
      );
    } catch (err) {
      logger.error({ err }, 'Webhook signature verification failed');
      return reply.status(400).send({
        error: { code: 'INVALID_SIGNATURE', message: 'Assinatura do webhook invalida' },
      });
    }

    if (!HANDLED_EVENTS.has(event.type)) {
      return reply.status(200).send({ received: true });
    }

    try {
      switch (event.type) {
        case 'checkout.session.completed':
          await handleCheckoutCompleted(event);
          break;
        case 'invoice.paid':
          await handleInvoicePaid(event);
          break;
        case 'invoice.payment_failed':
          await handleInvoicePaymentFailed(event);
          break;
        case 'customer.subscription.deleted':
          await handleSubscriptionDeleted(event);
          break;
      }
    } catch (err) {
      logger.error({ err, eventType: event.type, eventId: event.id }, 'Webhook handler error');
      return reply.status(500).send({
        error: { code: 'WEBHOOK_PROCESSING_ERROR', message: 'Erro ao processar webhook' },
      });
    }

    return reply.status(200).send({ received: true });
  });
}
