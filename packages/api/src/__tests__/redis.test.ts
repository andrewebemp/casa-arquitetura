import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../config/env', () => ({
  env: {
    SUPABASE_URL: 'https://test.supabase.co',
    SUPABASE_ANON_KEY: 'test-anon-key',
    SUPABASE_SERVICE_ROLE_KEY: 'test-service-key',
    REDIS_URL: 'redis://localhost:6379',
    PORT: 3001,
    NODE_ENV: 'test',
    CORS_ORIGINS: 'http://localhost:3000',
  },
}));

const { mockPing, mockQuit, mockOn } = vi.hoisted(() => ({
  mockPing: vi.fn(),
  mockQuit: vi.fn(),
  mockOn: vi.fn(),
}));

vi.mock('ioredis', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      ping: mockPing,
      quit: mockQuit,
      on: mockOn,
    })),
  };
});

vi.mock('../lib/logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
  },
}));

// Must import after mocks
import { getRedisClient, redisHealthCheck, disconnectRedis } from '../lib/redis';

describe('redis client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getRedisClient', () => {
    it('should return a Redis client instance', () => {
      const client = getRedisClient();
      expect(client).toBeDefined();
      expect(client.ping).toBeDefined();
    });

    it('should return the same instance on subsequent calls', () => {
      const client1 = getRedisClient();
      const client2 = getRedisClient();
      expect(client1).toBe(client2);
    });
  });

  describe('redisHealthCheck', () => {
    it('should return true when ping succeeds', async () => {
      mockPing.mockResolvedValue('PONG');
      const result = await redisHealthCheck();
      expect(result).toBe(true);
    });

    it('should return false when ping fails', async () => {
      mockPing.mockRejectedValue(new Error('Connection refused'));
      const result = await redisHealthCheck();
      expect(result).toBe(false);
    });
  });

  describe('disconnectRedis', () => {
    it('should call quit on the client', async () => {
      mockQuit.mockResolvedValue('OK');
      getRedisClient(); // ensure client exists
      await disconnectRedis();
      expect(mockQuit).toHaveBeenCalled();
    });
  });
});
