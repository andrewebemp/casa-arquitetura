import type { IncomingMessage, ServerResponse } from 'http';
import { buildApp } from '../src/app';

let app: any = null;

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    if (!app) {
      console.log('[vercel] Building Fastify app...');
      app = buildApp();
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
