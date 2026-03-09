import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';
import Fastify from 'fastify';
import type { FastifyInstance } from 'fastify';

vi.mock('../lib/supabase', () => ({
  supabaseAdmin: {
    auth: {
      getUser: vi.fn(),
    },
  },
  createUserClient: vi.fn(),
}));

vi.mock('../config/env', () => ({
  env: {
    SUPABASE_URL: 'https://test.supabase.co',
    SUPABASE_ANON_KEY: 'test-anon-key',
    SUPABASE_SERVICE_ROLE_KEY: 'test-service-key',
    REDIS_URL: 'redis://localhost:6379',
    PORT: 3001,
    NODE_ENV: 'test',
    CORS_ORIGINS: 'http://localhost:3000',
    ANTHROPIC_API_KEY: 'test-anthropic-key',
  },
}));

vi.mock('../lib/logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
  },
}));

vi.mock('../services/chat.service', () => ({
  chatService: {
    sendMessage: vi.fn(),
    getHistory: vi.fn(),
  },
}));

import { chatRoutes } from '../routes/chat.routes';
import { errorHandler } from '../middleware/error-handler';
import { chatService } from '../services/chat.service';
import { supabaseAdmin } from '../lib/supabase';
import { AppError } from '../lib/errors';

const mockChatService = vi.mocked(chatService);
const mockGetUser = vi.mocked(supabaseAdmin.auth.getUser);

const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000';
const MOCK_USER = {
  id: 'user-1',
  email: 'test@example.com',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  created_at: '2024-01-01',
};

let app: FastifyInstance;

async function buildApp() {
  const server = Fastify();
  server.setErrorHandler(errorHandler);
  server.register(chatRoutes, { prefix: '/projects' });
  await server.ready();
  return server;
}

function authHeaders() {
  return { authorization: 'Bearer valid-token' };
}

describe('chat routes', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    mockGetUser.mockResolvedValue({
      data: { user: MOCK_USER as never },
      error: null,
    });
    app = await buildApp();
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  describe('POST /projects/:id/chat', () => {
    it('should return 202 with chat_message_id, job_id and operations', async () => {
      const mockResult = {
        chat_message_id: 'msg-1',
        job_id: 'job-1',
        operations: [{ type: 'remove', target: 'tapete', params: {} }],
      };

      mockChatService.sendMessage.mockResolvedValue(mockResult);

      const response = await app.inject({
        method: 'POST',
        url: `/projects/${VALID_UUID}/chat`,
        headers: { ...authHeaders(), 'content-type': 'application/json' },
        body: JSON.stringify({ message: 'tira o tapete' }),
      });

      expect(response.statusCode).toBe(202);
      const body = JSON.parse(response.body);
      expect(body.data.chat_message_id).toBe('msg-1');
      expect(body.data.job_id).toBe('job-1');
      expect(body.data.operations).toHaveLength(1);
    });

    it('should pass correct arguments to chatService.sendMessage', async () => {
      mockChatService.sendMessage.mockResolvedValue({
        chat_message_id: 'msg-1',
        job_id: 'job-1',
        operations: [],
      });

      await app.inject({
        method: 'POST',
        url: `/projects/${VALID_UUID}/chat`,
        headers: { ...authHeaders(), 'content-type': 'application/json' },
        body: JSON.stringify({ message: 'deixa mais aconchegante' }),
      });

      expect(mockChatService.sendMessage).toHaveBeenCalledWith(
        VALID_UUID,
        'user-1',
        'deixa mais aconchegante',
        'valid-token',
      );
    });

    it('should return 401 without auth token', async () => {
      const response = await app.inject({
        method: 'POST',
        url: `/projects/${VALID_UUID}/chat`,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ message: 'tira o tapete' }),
      });

      expect(response.statusCode).toBe(401);
    });

    it('should return 400 for invalid UUID', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/projects/not-a-uuid/chat',
        headers: { ...authHeaders(), 'content-type': 'application/json' },
        body: JSON.stringify({ message: 'tira o tapete' }),
      });

      expect(response.statusCode).toBe(400);
    });

    it('should return 400 for empty message', async () => {
      const response = await app.inject({
        method: 'POST',
        url: `/projects/${VALID_UUID}/chat`,
        headers: { ...authHeaders(), 'content-type': 'application/json' },
        body: JSON.stringify({ message: '' }),
      });

      expect(response.statusCode).toBe(400);
    });

    it('should return 400 for missing message field', async () => {
      const response = await app.inject({
        method: 'POST',
        url: `/projects/${VALID_UUID}/chat`,
        headers: { ...authHeaders(), 'content-type': 'application/json' },
        body: JSON.stringify({}),
      });

      expect(response.statusCode).toBe(400);
    });

    it('should return 403 when project not owned by user', async () => {
      mockChatService.sendMessage.mockRejectedValue(
        new AppError({ code: 'PROJECT_NOT_FOUND', message: 'Projeto nao encontrado', statusCode: 403 }),
      );

      const response = await app.inject({
        method: 'POST',
        url: `/projects/${VALID_UUID}/chat`,
        headers: { ...authHeaders(), 'content-type': 'application/json' },
        body: JSON.stringify({ message: 'tira o tapete' }),
      });

      expect(response.statusCode).toBe(403);
    });
  });

  describe('GET /projects/:id/chat/history', () => {
    it('should return chat messages ordered by created_at ASC', async () => {
      const mockMessages = [
        { id: 'msg-1', content: 'tira o tapete', role: 'user', created_at: '2026-01-01T00:00:00Z' },
        { id: 'msg-2', content: 'muda a cor', role: 'user', created_at: '2026-01-01T00:01:00Z' },
      ];

      mockChatService.getHistory.mockResolvedValue(mockMessages);

      const response = await app.inject({
        method: 'GET',
        url: `/projects/${VALID_UUID}/chat/history`,
        headers: authHeaders(),
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data).toHaveLength(2);
      expect(body.data[0].id).toBe('msg-1');
    });

    it('should pass cursor and limit query params', async () => {
      mockChatService.getHistory.mockResolvedValue([]);

      await app.inject({
        method: 'GET',
        url: `/projects/${VALID_UUID}/chat/history?limit=10&cursor=2026-01-01T00:00:00Z`,
        headers: authHeaders(),
      });

      expect(mockChatService.getHistory).toHaveBeenCalledWith(
        VALID_UUID,
        'user-1',
        'valid-token',
        10,
        '2026-01-01T00:00:00Z',
      );
    });

    it('should use default limit when not provided', async () => {
      mockChatService.getHistory.mockResolvedValue([]);

      await app.inject({
        method: 'GET',
        url: `/projects/${VALID_UUID}/chat/history`,
        headers: authHeaders(),
      });

      expect(mockChatService.getHistory).toHaveBeenCalledWith(
        VALID_UUID,
        'user-1',
        'valid-token',
        50,
        undefined,
      );
    });

    it('should return 401 without auth token', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/projects/${VALID_UUID}/chat/history`,
      });

      expect(response.statusCode).toBe(401);
    });

    it('should return 400 for invalid UUID', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/projects/invalid/chat/history',
        headers: authHeaders(),
      });

      expect(response.statusCode).toBe(400);
    });

    it('should return 403 for unauthorized project', async () => {
      mockChatService.getHistory.mockRejectedValue(
        new AppError({ code: 'PROJECT_NOT_FOUND', message: 'Not found', statusCode: 403 }),
      );

      const response = await app.inject({
        method: 'GET',
        url: `/projects/${VALID_UUID}/chat/history`,
        headers: authHeaders(),
      });

      expect(response.statusCode).toBe(403);
    });
  });
});
