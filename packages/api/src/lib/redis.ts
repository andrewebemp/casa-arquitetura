import Redis from 'ioredis';
import { env } from '../config/env';
import { logger } from './logger';

let redisClient: Redis | null = null;

export const getRedisClient = (): Redis => {
  if (!redisClient) {
    redisClient = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: null,
      enableReadyCheck: true,
      lazyConnect: true,
    });

    redisClient.on('error', (err) => {
      logger.error({ err }, 'Redis connection error');
    });
  }

  return redisClient;
};

export const redisHealthCheck = async (): Promise<boolean> => {
  try {
    const client = getRedisClient();
    const result = await client.ping();
    return result === 'PONG';
  } catch (err) {
    logger.error({ err }, 'Redis health check failed');
    return false;
  }
};

export const disconnectRedis = async (): Promise<void> => {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
};
