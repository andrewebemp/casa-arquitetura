import { FastifyInstance } from 'fastify';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { checkoutSchema } from '../schemas/subscription.schema';
import { subscriptionService } from '../services/subscription.service';
import { stripe } from '../lib/stripe';
import type { CheckoutInput } from '../schemas/subscription.schema';

export async function subscriptionRoutes(server: FastifyInstance): Promise<void> {
  // POST /subscriptions/checkout - Create checkout session (Stripe or Asaas)
  server.post<{ Body: CheckoutInput }>('/checkout', {
    preHandler: [authMiddleware, validate({ body: checkoutSchema })],
  }, async (request, reply) => {
    const userId = request.user!.id;
    const { tier, gateway, payment_method } = request.body;
    const result = await subscriptionService.createCheckoutSession(userId, tier, gateway, payment_method);
    return reply.status(200).send({ data: result });
  });

  // GET /subscriptions/me - Get current subscription
  server.get('/me', {
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    const userId = request.user!.id;
    const subscription = await subscriptionService.getByUserId(userId);

    if (!subscription) {
      return reply.status(200).send({
        data: {
          tier: 'free',
          status: 'active',
          renders_used: 0,
          renders_limit: 3,
          portal_url: null,
          gateway: null,
        },
      });
    }

    let portalUrl: string | null = null;
    if (subscription.payment_gateway === 'stripe' && subscription.gateway_customer_id) {
      try {
        const session = await stripe.billingPortal.sessions.create({
          customer: subscription.gateway_customer_id,
          return_url: `${request.headers.origin || 'http://localhost:3000'}/subscription`,
        });
        portalUrl = session.url;
      } catch {
        // Portal URL generation is best-effort
      }
    }

    return reply.status(200).send({
      data: {
        ...subscription,
        gateway: subscription.payment_gateway,
        portal_url: portalUrl,
      },
    });
  });

  // POST /subscriptions/portal - Create Stripe billing portal session
  server.post('/portal', {
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    const userId = request.user!.id;
    const result = await subscriptionService.createPortalSession(userId);
    return reply.status(200).send({ data: result });
  });
}
