import type { IncomingMessage, ServerResponse } from 'http';

// Intercept process.exit to prevent silent death in serverless
const origExit = process.exit;
(process as any).exit = (code?: number) => {
  console.error('[vercel] process.exit called with code:', code);
  console.error('[vercel] Stack trace:', new Error().stack);
  // Don't actually exit — throw instead so the error is caught
  throw new Error(`process.exit(${code}) intercepted`);
};

let app: any = null;
let initError: Error | null = null;

async function getApp() {
  if (initError) throw initError;
  if (app) return app;

  try {
    console.log('[vercel] Step 1: importing buildApp...');
    const { buildApp } = require('../src/app');

    console.log('[vercel] Step 2: calling buildApp()...');
    app = buildApp();

    console.log('[vercel] Step 3: calling app.ready()...');
    await app.ready();

    console.log('[vercel] Step 4: App ready!');
    return app;
  } catch (err: any) {
    console.error('[vercel] Init error:', err?.message || err);
    initError = err;
    throw err;
  }
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
