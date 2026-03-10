import type { IncomingMessage, ServerResponse } from 'http';
import Fastify from 'fastify';
import multipart from '@fastify/multipart';
import { env } from '../src/config/env';
import { errorHandler } from '../src/middleware/error-handler';
import { authRoutes } from '../src/routes/auth.routes';
import { projectRoutes } from '../src/routes/project.routes';
import { profileRoutes } from '../src/routes/profile.routes';
import { spatialRoutes } from '../src/routes/spatial.routes';
import { referenceRoutes } from '../src/routes/reference.routes';
import { croquiRoutes } from '../src/routes/croqui.routes';
import { renderRoutes } from '../src/routes/render.routes';
import { subscriptionRoutes } from '../src/routes/subscription.routes';
import { webhookRoutes } from '../src/routes/webhook.routes';
import { chatRoutes } from '../src/routes/chat.routes';
import { versionRoutes } from '../src/routes/version.routes';
import { stagingRoutes, stagingStylesRoutes } from '../src/routes/staging.routes';
import { segmentationRoutes } from '../src/routes/segmentation.routes';
import { lightingRoutes } from '../src/routes/lighting.routes';
import { objectRemovalRoutes } from '../src/routes/object-removal.routes';
import { shareLinkRoutes, publicShareRoutes } from '../src/routes/share-link.routes';
import { diagnosticsRoutes } from '../src/routes/diagnostics.routes';
import { asaasWebhookRoutes } from '../src/routes/asaas-webhook.routes';
import { cacheRoutes } from '../src/routes/cache.routes';
// NOTE: rateLimitMiddleware is intentionally excluded — its import chain
// (subscription service → stripe SDK) causes the bundled module to hang.
// Vercel provides edge-level rate limiting instead.

let app: any = null;

function buildServerlessApp() {
  const server = Fastify({ logger: false });
  server.setErrorHandler(errorHandler);
  server.register(multipart, { limits: { fileSize: 20 * 1024 * 1024 } });

  const corsOrigins = env.CORS_ORIGINS.split(',').map((o: string) => o.trim());
  server.addHook('onRequest', async (request: any, reply: any) => {
    const origin = request.headers.origin;
    if (origin && corsOrigins.includes(origin)) {
      reply.header('Access-Control-Allow-Origin', origin);
      reply.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
      reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      reply.header('Access-Control-Allow-Credentials', 'true');
    }
    if (request.method === 'OPTIONS') return reply.status(204).send();
  });

  server.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));

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

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    if (!app) {
      console.log('[vercel] Building Fastify app...');
      app = buildServerlessApp();
      await app.ready();
      console.log('[vercel] App ready!');
    }
    app.server.emit('request', req, res);
  } catch (err: any) {
    console.error('[vercel] Error:', err?.message || err);
    res.writeHead(500, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ error: err?.message || 'Internal server error' }));
  }
}
