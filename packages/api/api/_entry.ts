import type { IncomingMessage, ServerResponse } from 'http';

// Minimal diagnostic handler to verify Build Output API v3 works
export async function handler(req: IncomingMessage, res: ServerResponse) {
  console.log('[vercel] handler called', req.method, req.url);
  res.writeHead(200, { 'content-type': 'application/json' });
  res.end(JSON.stringify({
    status: 'ok',
    method: req.method,
    url: req.url,
    timestamp: new Date().toISOString(),
  }));
}
