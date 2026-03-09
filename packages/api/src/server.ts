import Fastify from 'fastify';
import { env } from './config/env';
import { logger } from './lib/logger';
import { errorHandler } from './middleware/error-handler';
import { authRoutes } from './routes/auth.routes';

const server = Fastify({ logger: false });

server.setErrorHandler(errorHandler);

const corsOrigins = env.CORS_ORIGINS.split(',').map((o) => o.trim());
server.addHook('onRequest', async (request, reply) => {
  const origin = request.headers.origin;
  if (origin && corsOrigins.includes(origin)) {
    reply.header('Access-Control-Allow-Origin', origin);
    reply.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    reply.header('Access-Control-Allow-Credentials', 'true');
  }
  if (request.method === 'OPTIONS') {
    return reply.status(204).send();
  }
});

server.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

server.register(authRoutes, { prefix: '/auth' });

const start = async () => {
  try {
    await server.listen({ port: env.PORT, host: '0.0.0.0' });
    logger.info(`API server running on 0.0.0.0:${env.PORT}`);
  } catch (err) {
    logger.error(err, 'Failed to start server');
    process.exit(1);
  }
};

start();
