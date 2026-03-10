import type { IncomingMessage, ServerResponse } from 'http';
import Stripe from 'stripe';
import { env } from '../src/config/env';

console.log('[vercel] Creating Stripe instance...');
const stripe = new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: '2025-02-24.acacia' as any });
console.log('[vercel] Stripe created OK');

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  console.log('[vercel] handler called');
  res.writeHead(200, { 'content-type': 'application/json' });
  res.end(JSON.stringify({ status: 'ok', stripeOk: !!stripe }));
}
