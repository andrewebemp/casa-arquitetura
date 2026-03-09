import { FastifyRequest, FastifyReply } from 'fastify';
import type { SubscriptionTier } from '@decorai/shared';
import { rateLimitService } from '../services/rate-limit.service';
import { subscriptionService } from '../services/subscription.service';
import { supabaseAdmin } from '../lib/supabase';
import { logger } from '../lib/logger';

const WEBHOOK_PREFIXES = ['/webhooks/'];

const isWebhookRoute = (url: string): boolean => {
  return WEBHOOK_PREFIXES.some((prefix) => url.startsWith(prefix));
};

const getClientIp = (request: FastifyRequest): string => {
  const forwarded = request.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return request.ip || '0.0.0.0';
};

const resolveUserId = async (request: FastifyRequest): Promise<string | null> => {
  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  try {
    const token = authHeader.slice(7);
    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !data.user) {
      return null;
    }
    return data.user.id;
  } catch {
    return null;
  }
};

export const rateLimitMiddleware = async (
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> => {
  if (isWebhookRoute(request.url)) {
    return;
  }

  let identifier: string;
  let tier: SubscriptionTier | 'anonymous' = 'anonymous';
  let isIp = true;

  const userId = await resolveUserId(request);

  if (userId) {
    identifier = userId;
    isIp = false;

    try {
      const subscription = await subscriptionService.getByUserId(userId);
      tier = (subscription?.tier as SubscriptionTier) || 'free';
    } catch (err) {
      logger.warn({ err, userId }, 'Failed to resolve user tier for rate limiting, defaulting to free');
      tier = 'free';
    }
  } else {
    identifier = getClientIp(request);
  }

  const result = await rateLimitService.checkAndIncrement(identifier, tier, isIp);

  const resetSeconds = Math.max(1, Math.ceil((result.resetAt - Date.now()) / 1000));

  reply.header('X-RateLimit-Limit', result.limit);
  reply.header('X-RateLimit-Remaining', result.remaining);
  reply.header('X-RateLimit-Reset', Math.ceil(result.resetAt / 1000));

  if (!result.allowed) {
    reply.header('Retry-After', resetSeconds);
    return reply.status(429).send({
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Limite de requisicoes excedido. Tente novamente em breve.',
      },
      limit: result.limit,
      remaining: 0,
      resetAt: new Date(result.resetAt).toISOString(),
    });
  }
};
