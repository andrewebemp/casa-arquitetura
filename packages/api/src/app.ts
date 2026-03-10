import Fastify from 'fastify';
import multipart from '@fastify/multipart';
import { env } from './config/env';
import { errorHandler } from './middleware/error-handler';
import { authRoutes } from './routes/auth.routes';
import { projectRoutes } from './routes/project.routes';
import { profileRoutes } from './routes/profile.routes';
import { spatialRoutes } from './routes/spatial.routes';
import { referenceRoutes } from './routes/reference.routes';
import { croquiRoutes } from './routes/croqui.routes';
import { renderRoutes } from './routes/render.routes';
import { subscriptionRoutes } from './routes/subscription.routes';
import { webhookRoutes } from './routes/webhook.routes';
import { chatRoutes } from './routes/chat.routes';
import { versionRoutes } from './routes/version.routes';
import { stagingRoutes, stagingStylesRoutes } from './routes/staging.routes';
import { segmentationRoutes } from './routes/segmentation.routes';
import { lightingRoutes } from './routes/lighting.routes';
import { objectRemovalRoutes } from './routes/object-removal.routes';
import { shareLinkRoutes, publicShareRoutes } from './routes/share-link.routes';
import { diagnosticsRoutes } from './routes/diagnostics.routes';
import { asaasWebhookRoutes } from './routes/asaas-webhook.routes';
import { rateLimitMiddleware } from './middleware/rate-limit.middleware';
import { cacheRoutes } from './routes/cache.routes';

export function buildApp() {
  const server = Fastify({ logger: false });

  server.setErrorHandler(errorHandler);

  server.register(multipart, {
    limits: {
      fileSize: 20 * 1024 * 1024, // 20MB
    },
  });

  const corsOrigins = env.CORS_ORIGINS.split(',').map((o) => o.trim());
  server.addHook('onRequest', async (request, reply) => {
    const origin = request.headers.origin;
    if (origin && corsOrigins.includes(origin)) {
      reply.header('Access-Control-Allow-Origin', origin);
      reply.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
      reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      reply.header('Access-Control-Allow-Credentials', 'true');
    }
    if (request.method === 'OPTIONS') {
      return reply.status(204).send();
    }
  });

  server.addHook('onRequest', rateLimitMiddleware);

  server.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  server.register(authRoutes, { prefix: '/auth' });
  server.register(profileRoutes, { prefix: '/profile' });
  server.register(projectRoutes, { prefix: '/projects' });
  server.register(spatialRoutes, { prefix: '/projects' });
  server.register(referenceRoutes, { prefix: '/projects' });
  server.register(croquiRoutes, { prefix: '/projects' });
  server.register(chatRoutes, { prefix: '/projects' });
  server.register(versionRoutes, { prefix: '/projects' });
  server.register(renderRoutes);
  server.register(stagingStylesRoutes, { prefix: '/api/staging' });
  server.register(stagingRoutes, { prefix: '/api/projects' });
  server.register(segmentationRoutes, { prefix: '/api/projects' });
  server.register(lightingRoutes, { prefix: '/api/projects' });
  server.register(objectRemovalRoutes, { prefix: '/api/projects' });
  server.register(shareLinkRoutes, { prefix: '/api/projects' });
  server.register(publicShareRoutes, { prefix: '/api/share' });
  server.register(diagnosticsRoutes, { prefix: '/api' });
  server.register(subscriptionRoutes, { prefix: '/subscriptions' });
  server.register(webhookRoutes, { prefix: '/webhooks' });
  server.register(asaasWebhookRoutes, { prefix: '/webhooks' });
  server.register(cacheRoutes, { prefix: '/api' });

  return server;
}
