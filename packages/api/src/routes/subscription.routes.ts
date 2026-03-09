import { FastifyInstance } from 'fastify';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { checkoutSchema } from '../schemas/subscription.schema';
import { subscriptionService } from '../services/subscription.service';
import { stripe } from '../lib/stripe';
import type { CheckoutInput } from '../schemas/subscription.schema';

export async function subscriptionRoutes(server: FastifyInstance): Promise<void> {
  // POST /subscriptions/checkout - Create Stripe checkout session
  server.post<{ Body: CheckoutInput }>('/checkout', {
    preHandler: [authMiddleware, validate({ body: checkoutSchema })],
  }, async (request, reply) => {
    const userId = request.user!.id;
    const result = await subscriptionService.createCheckoutSession(userId, request.body.tier);
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
        },
      });
    }

    let portalUrl: string | null = null;
    if (subscription.gateway_customer_id) {
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
