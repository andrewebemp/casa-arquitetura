import type { IncomingMessage, ServerResponse } from 'http';
import Fastify from 'fastify';
import multipart from '@fastify/multipart';
import { env } from '../src/config/env';
import { errorHandler } from '../src/middleware/error-handler';
import { rateLimitMiddleware } from '../src/middleware/rate-limit.middleware';
import { authRoutes } from '../src/routes/auth.routes';
import { projectRoutes } from '../src/routes/project.routes';
import { profileRoutes } from '../src/routes/profile.routes';

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
