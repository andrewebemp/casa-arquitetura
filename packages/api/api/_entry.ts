import type { IncomingMessage, ServerResponse } from 'http';
import Redis from 'ioredis';
import { env } from '../src/config/env';

console.log('[vercel] Creating Redis client...');
const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: true,
  lazyConnect: true,
});
console.log('[vercel] Redis client created (lazyConnect)');

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  console.log('[vercel] handler called');
  res.writeHead(200, { 'content-type': 'application/json' });
  res.end(JSON.stringify({ status: 'ok', redisStatus: redis.status }));
}
