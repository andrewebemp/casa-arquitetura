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
import { subscriptionRoutes } from '../src/routes/subscription.routes';
import { webhookRoutes } from '../src/routes/webhook.routes';
import { versionRoutes } from '../src/routes/version.routes';
import { shareLinkRoutes, publicShareRoutes } from '../src/routes/share-link.routes';
import { diagnosticsRoutes } from '../src/routes/diagnostics.routes';
import { asaasWebhookRoutes } from '../src/routes/asaas-webhook.routes';
import { cacheRoutes } from '../src/routes/cache.routes';
// Skip bullmq-dependent routes for now
// import { renderRoutes } from '../src/routes/render.routes';
// import { chatRoutes } from '../src/routes/chat.routes';
// import { stagingRoutes, stagingStylesRoutes } from '../src/routes/staging.routes';
// import { segmentationRoutes } from '../src/routes/segmentation.routes';
// import { lightingRoutes } from '../src/routes/lighting.routes';
// import { objectRemovalRoutes } from '../src/routes/object-removal.routes';
import { rateLimitMiddleware } from '../src/middleware/rate-limit.middleware';

console.log('[vercel] All modules imported');

let app: any = null;

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    if (!app) {
      console.log('[vercel] Building app...');
      app = Fastify({ logger: false });
      app.setErrorHandler(errorHandler);
      app.register(multipart, { limits: { fileSize: 20 * 1024 * 1024 } });

      const corsOrigins = (env.CORS_ORIGINS || '').split(',').map((o: string) => o.trim());
      app.addHook('onRequest', async (request: any, reply: any) => {
        const origin = request.headers.origin;
        if (origin && corsOrigins.includes(origin)) {
          reply.header('Access-Control-Allow-Origin', origin);
          reply.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
          reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
          reply.header('Access-Control-Allow-Credentials', 'true');
        }
        if (request.method === 'OPTIONS') return reply.status(204).send();
      });
      app.addHook('onRequest', rateLimitMiddleware);

      app.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));

      app.register(authRoutes, { prefix: '/auth' });
      app.register(profileRoutes, { prefix: '/profile' });
      app.register(projectRoutes, { prefix: '/projects' });
      app.register(spatialRoutes, { prefix: '/projects' });
      app.register(referenceRoutes, { prefix: '/projects' });
      app.register(croquiRoutes, { prefix: '/projects' });
      // app.register(chatRoutes, { prefix: '/projects' });
      app.register(versionRoutes, { prefix: '/projects' });
      // app.register(renderRoutes);
      // app.register(stagingStylesRoutes, { prefix: '/api/staging' });
      // app.register(stagingRoutes, { prefix: '/api/projects' });
      // app.register(segmentationRoutes, { prefix: '/api/projects' });
      // app.register(lightingRoutes, { prefix: '/api/projects' });
      // app.register(objectRemovalRoutes, { prefix: '/api/projects' });
      app.register(shareLinkRoutes, { prefix: '/api/projects' });
      app.register(publicShareRoutes, { prefix: '/api/share' });
      app.register(diagnosticsRoutes, { prefix: '/api' });
      app.register(subscriptionRoutes, { prefix: '/subscriptions' });
      app.register(webhookRoutes, { prefix: '/webhooks' });
      app.register(asaasWebhookRoutes, { prefix: '/webhooks' });
      app.register(cacheRoutes, { prefix: '/api' });

      console.log('[vercel] Calling ready...');
      await app.ready();
      console.log('[vercel] Ready!');
    }
    app.server.emit('request', req, res);
  } catch (err: any) {
    console.error('[vercel] Error:', err?.message || err);
    res.writeHead(500, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ error: err?.message || 'Internal server error' }));
  }
}
