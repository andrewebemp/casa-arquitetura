import type { IncomingMessage, ServerResponse } from 'http';

let app: any = null;

async function getApp() {
  if (app) return app;

  console.log('[vercel] Step 1: requiring env...');
  const { env } = require('../src/config/env');
  console.log('[vercel] Step 1 done. NODE_ENV:', env.NODE_ENV);

  console.log('[vercel] Step 2: requiring logger...');
  const { logger } = require('../src/lib/logger');
  console.log('[vercel] Step 2 done.');

  console.log('[vercel] Step 3: requiring fastify...');
  const Fastify = require('fastify');
  app = Fastify.default ? Fastify.default({ logger: false }) : Fastify({ logger: false });

  app.get('/health', async () => ({ status: 'ok', env: env.NODE_ENV, timestamp: new Date().toISOString() }));

  console.log('[vercel] Step 4: calling app.ready()...');
  await app.ready();
  console.log('[vercel] Step 5: App ready!');
  return app;
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    const fastify = await getApp();
    fastify.server.emit('request', req, res);
  } catch (err: any) {
    console.error('[vercel] Handler error:', err?.message || err);
    res.writeHead(500, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ error: err?.message || 'Internal server error' }));
  }
}
