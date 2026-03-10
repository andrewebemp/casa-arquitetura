import type { VercelRequest, VercelResponse } from '@vercel/node';
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const fastify = await getApp();

    // Build headers object (flatten arrays)
    const headers: Record<string, string> = {};
    for (const [key, val] of Object.entries(req.headers)) {
      if (val) headers[key] = Array.isArray(val) ? val.join(', ') : val;
    }

    // Determine payload: Vercel already parses JSON body for us
    let payload: string | Buffer | undefined;
    if (req.body !== undefined && req.body !== null) {
      const ct = headers['content-type'] || '';
      if (ct.includes('application/json')) {
        payload = JSON.stringify(req.body);
      } else if (typeof req.body === 'string') {
        payload = req.body;
      } else if (Buffer.isBuffer(req.body)) {
        payload = req.body;
      } else {
        payload = JSON.stringify(req.body);
      }
    }

    // Use fastify.inject() — works in serverless without native HTTP server
    const response = await fastify.inject({
      method: req.method as any,
      url: req.url || '/',
      headers,
      payload,
    });

    // Forward status and headers
    res.status(response.statusCode);
    for (const [key, val] of Object.entries(response.headers)) {
      if (val) res.setHeader(key, val as string);
    }
    res.end(response.rawPayload);
  } catch (err) {
    console.error('[vercel] Handler error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
