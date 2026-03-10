import type { VercelRequest, VercelResponse } from '@vercel/node';
import { buildApp } from '../src/app';

let handler: ((req: VercelRequest, res: VercelResponse) => void) | null = null;

async function getHandler() {
  if (handler) return handler;
  const app = buildApp();
  await app.ready();
  handler = async (req: VercelRequest, res: VercelResponse) => {
    app.server.emit('request', req, res);
  };
  return handler;
}

export default async function (req: VercelRequest, res: VercelResponse) {
  const h = await getHandler();
  return h(req, res);
}
