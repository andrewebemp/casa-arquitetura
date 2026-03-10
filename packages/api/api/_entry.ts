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

// Lambda-style handler for Vercel Build Output API v3
export async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    const fastify = await getApp();

    // Build headers object (flatten arrays)
    const headers: Record<string, string> = {};
    for (const [key, val] of Object.entries(req.headers)) {
      if (val) headers[key] = Array.isArray(val) ? val.join(', ') : val;
    }

    // Use fastify.inject() — works in serverless without native HTTP server
    const response = await fastify.inject({
      method: req.method as any,
      url: req.url || '/',
      headers,
      payload: req,
    });

    // Forward status and headers
    res.writeHead(response.statusCode, response.headers as any);
    res.end(response.rawPayload);
  } catch (err) {
    console.error('[vercel] Handler error:', err);
    res.writeHead(500, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ error: 'Internal server error' }));
  }
}
