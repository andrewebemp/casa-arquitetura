import { FastifyInstance } from 'fastify';
import { env } from '../config/env';
import { logger } from '../lib/logger';
import {
  handleAsaasPaymentConfirmed,
  handleAsaasPaymentReceived,
  handleAsaasPaymentOverdue,
  handleAsaasSubscriptionDeleted,
} from '../services/asaas-webhook-handlers';
import type { AsaasWebhookPayload, AsaasWebhookEventType } from '@decorai/shared';

const HANDLED_EVENTS = new Set<AsaasWebhookEventType>([
  'PAYMENT_CONFIRMED',
  'PAYMENT_RECEIVED',
  'PAYMENT_OVERDUE',
  'SUBSCRIPTION_DELETED',
]);

export async function asaasWebhookRoutes(server: FastifyInstance): Promise<void> {
  server.post('/asaas', async (request, reply) => {
    const token = request.headers['asaas-access-token'] as string | undefined;

    if (!token || token !== env.ASAAS_WEBHOOK_TOKEN) {
      return reply.status(400).send({
        error: { code: 'INVALID_TOKEN', message: 'Token de webhook Asaas invalido' },
      });
    }

    const payload = request.body as AsaasWebhookPayload;

    if (!payload || !payload.event) {
      return reply.status(400).send({
        error: { code: 'INVALID_PAYLOAD', message: 'Payload de webhook invalido' },
      });
    }

    if (!HANDLED_EVENTS.has(payload.event)) {
      return reply.status(200).send({ received: true });
    }

    try {
      switch (payload.event) {
        case 'PAYMENT_CONFIRMED':
          await handleAsaasPaymentConfirmed(payload);
          break;
        case 'PAYMENT_RECEIVED':
          await handleAsaasPaymentReceived(payload);
          break;
        case 'PAYMENT_OVERDUE':
          await handleAsaasPaymentOverdue(payload);
          break;
        case 'SUBSCRIPTION_DELETED':
          await handleAsaasSubscriptionDeleted(payload);
          break;
      }
    } catch (err) {
      logger.error({ err, event: payload.event }, 'Asaas webhook handler error');
      return reply.status(500).send({
        error: { code: 'WEBHOOK_PROCESSING_ERROR', message: 'Erro ao processar webhook Asaas' },
      });
    }

    return reply.status(200).send({ received: true });
  });
}
