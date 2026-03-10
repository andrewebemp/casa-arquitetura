import { env } from './config/env';
import { logger } from './lib/logger';
import { buildApp } from './app';

const server = buildApp();

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
