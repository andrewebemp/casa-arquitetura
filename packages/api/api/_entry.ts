import type { IncomingMessage, ServerResponse } from 'http';
import Fastify from 'fastify';
import multipart from '@fastify/multipart';
import { env } from '../src/config/env';
import { authRoutes } from '../src/routes/auth.routes';
import { projectRoutes } from '../src/routes/project.routes';
import { profileRoutes } from '../src/routes/profile.routes';

console.log('[vercel] Module loading...');

let app: any = null;

function buildServerlessApp() {
  const server = Fastify({ logger: false });

  server.register(multipart, { limits: { fileSize: 20 * 1024 * 1024 } });

  const corsOrigins = (env.CORS_ORIGINS || '').split(',').map((o: string) => o.trim());
  server.addHook('onRequest', async (request: any, reply: any) => {
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

  server.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));

  // Only register a few routes to test
  server.register(authRoutes, { prefix: '/auth' });
  server.register(profileRoutes, { prefix: '/profile' });
  server.register(projectRoutes, { prefix: '/projects' });

  return server;
}

console.log('[vercel] Module loaded successfully');

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    if (!app) {
      console.log('[vercel] Creating Fastify app...');
      app = buildServerlessApp();
      console.log('[vercel] Calling ready()...');
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
