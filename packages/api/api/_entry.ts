import type { IncomingMessage, ServerResponse } from 'http';

let app: any = null;

async function getApp() {
  if (app) return app;

  console.log('[vercel] Step 1: importing buildApp...');
  const { buildApp } = await import('../src/app');

  console.log('[vercel] Step 2: calling buildApp()...');
  app = buildApp();

  console.log('[vercel] Step 3: calling app.ready()...');
  const readyPromise = app.ready();

  // Add a 10-second timeout to detect if ready() hangs
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('app.ready() timed out after 10s')), 10000)
  );

  await Promise.race([readyPromise, timeout]);
  console.log('[vercel] Step 4: App ready!');
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
