import type { IncomingMessage, ServerResponse } from 'http';
import { buildApp } from '../src/app';

let app: any = null;
let initError: string | null = null;

async function getApp() {
  if (initError) throw new Error(initError);
  if (app) return app;

  try {
    console.log('[vercel] buildApp()...');
    app = buildApp();
    console.log('[vercel] app.ready()...');

    // Race against a 8-second timeout
    await Promise.race([
      app.ready(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('app.ready() timeout 8s')), 8000))
    ]);

    console.log('[vercel] Ready!');
    return app;
  } catch (err: any) {
    initError = err?.message || 'Unknown init error';
    app = null;
    throw err;
  }
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    const fastify = await getApp();
    fastify.server.emit('request', req, res);
  } catch (err: any) {
    console.error('[vercel] Error:', err?.message || err);
    res.writeHead(500, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ error: err?.message || 'Internal server error' }));
  }
}
