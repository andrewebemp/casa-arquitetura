import type { IncomingMessage, ServerResponse } from 'http';
import { buildApp } from '../src/app';
import type { FastifyInstance } from 'fastify';

let app: FastifyInstance | null = null;

async function getApp(): Promise<FastifyInstance> {
  if (app) return app;
  console.log('[vercel] Building Fastify app...');
  app = buildApp();
  console.log('[vercel] Calling app.ready()...');
  await app.ready();
  console.log('[vercel] App ready!');
  return app;
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    const fastify = await getApp();
    fastify.server.emit('request', req, res);
  } catch (err) {
    console.error('[vercel] Handler error:', err);
    res.writeHead(500, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ error: 'Internal server error' }));
  }
}
