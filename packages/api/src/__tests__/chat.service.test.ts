import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockFrom = vi.fn();
const mockAdminFrom = vi.fn();

vi.mock('../lib/supabase', () => ({
  supabaseAdmin: { from: (...args: unknown[]) => mockAdminFrom(...args), channel: vi.fn() },
  createUserClient: vi.fn(() => ({
    from: mockFrom,
  })),
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

const mockCreate = vi.fn();
vi.mock('../lib/anthropic', () => ({
  getAnthropicClient: vi.fn(() => ({
    messages: { create: mockCreate },
  })),
}));

vi.mock('../queue/render.queue', () => ({
  enqueueRenderJob: vi.fn().mockResolvedValue('job-queued-id'),
}));

vi.mock('../services/quota.service', () => ({
  quotaService: {
    enforceQuota: vi.fn().mockResolvedValue({
      allowed: true,
      renders_used: 1,
      renders_limit: 100,
      remaining: 99,
      tier: 'pro',
    }),
  },
}));

vi.mock('../queue/chat.events', () => ({
  chatEvents: {
    broadcast: vi.fn().mockResolvedValue(undefined),
  },
}));

import { chatService, _extractOperations } from '../services/chat.service';
import { AppError } from '../lib/errors';

const TOKEN = 'test-access-token';
const USER_ID = 'user-123';
const PROJECT_ID = 'proj-123';

function mockChain(result: { data?: unknown; error?: unknown }) {
  const chain: Record<string, unknown> = {};
  chain.insert = vi.fn().mockReturnValue(chain);
  chain.select = vi.fn().mockReturnValue(chain);
  chain.update = vi.fn().mockReturnValue(chain);
  chain.delete = vi.fn().mockReturnValue(chain);
  chain.eq = vi.fn().mockReturnValue(chain);
  chain.gt = vi.fn().mockReturnValue(chain);
  chain.order = vi.fn().mockReturnValue(chain);
  chain.limit = vi.fn().mockReturnValue(chain);
  chain.single = vi.fn().mockResolvedValue(result);
  return chain;
}

function mockArrayChain(result: { data?: unknown[]; error?: unknown }) {
  const chain: Record<string, unknown> = {};
  chain.select = vi.fn().mockReturnValue(chain);
  chain.eq = vi.fn().mockReturnValue(chain);
  chain.gt = vi.fn().mockReturnValue(chain);
  chain.order = vi.fn().mockReturnValue(chain);
  chain.limit = vi.fn().mockReturnValue(chain);
  chain.then = vi.fn((resolve: (value: unknown) => void) => resolve(result));
  return chain;
}

describe('chatService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('extractOperations (NLU)', () => {
    it('should extract remove operation from PT-BR command', async () => {
      mockCreate.mockResolvedValue({
        content: [{ type: 'text', text: '[{"type":"remove","target":"tapete","params":{}}]' }],
      });

      const ops = await _extractOperations('tira o tapete', '');
      expect(ops).toHaveLength(1);
      expect(ops[0].type).toBe('remove');
      expect(ops[0].target).toBe('tapete');
    });

    it('should extract change operation with params', async () => {
      mockCreate.mockResolvedValue({
        content: [{
          type: 'text',
          text: '[{"type":"change","target":"piso","params":{"material":"madeira clara"}}]',
        }],
      });

      const ops = await _extractOperations('muda o piso para madeira clara', '');
      expect(ops).toHaveLength(1);
      expect(ops[0].type).toBe('change');
      expect(ops[0].target).toBe('piso');
      expect(ops[0].params).toEqual({ material: 'madeira clara' });
    });

    it('should extract multiple operations from compound command', async () => {
      mockCreate.mockResolvedValue({
        content: [{
          type: 'text',
          text: '[{"type":"remove","target":"tapete","params":{}},{"type":"change","target":"piso","params":{"material":"madeira clara"}}]',
        }],
      });

      const ops = await _extractOperations('tira o tapete e muda o piso para madeira clara', '');
      expect(ops).toHaveLength(2);
      expect(ops[0].type).toBe('remove');
      expect(ops[1].type).toBe('change');
    });

    it('should extract add operation', async () => {
      mockCreate.mockResolvedValue({
        content: [{
          type: 'text',
          text: '[{"type":"add","target":"planta","params":{"position":"canto"}}]',
        }],
      });

      const ops = await _extractOperations('coloca uma planta no canto', '');
      expect(ops).toHaveLength(1);
      expect(ops[0].type).toBe('add');
      expect(ops[0].target).toBe('planta');
      expect(ops[0].params).toEqual({ position: 'canto' });
    });

    it('should extract adjust operation for ambiance', async () => {
      mockCreate.mockResolvedValue({
        content: [{
          type: 'text',
          text: '[{"type":"adjust","target":"ambiente","params":{"mood":"aconchegante","lighting":"quente"}}]',
        }],
      });

      const ops = await _extractOperations('deixa mais aconchegante com iluminacao quente', '');
      expect(ops).toHaveLength(1);
      expect(ops[0].type).toBe('adjust');
      expect(ops[0].params.mood).toBe('aconchegante');
    });

    it('should throw NLU_EXTRACTION_FAILED when Claude returns empty response', async () => {
      mockCreate.mockResolvedValue({ content: [] });

      try {
        await _extractOperations('test', '');
        expect.unreachable('Should have thrown');
      } catch (err) {
        expect((err as AppError).code).toBe('NLU_EXTRACTION_FAILED');
      }
    });

    it('should throw NLU_PARSE_FAILED when Claude returns invalid JSON', async () => {
      mockCreate.mockResolvedValue({
        content: [{ type: 'text', text: 'not valid json' }],
      });

      try {
        await _extractOperations('test', '');
        expect.unreachable('Should have thrown');
      } catch (err) {
        expect((err as AppError).code).toBe('NLU_PARSE_FAILED');
      }
    });

    it('should include spatial context in Claude prompt when available', async () => {
      mockCreate.mockResolvedValue({
        content: [{ type: 'text', text: '[{"type":"remove","target":"sofa","params":{}}]' }],
      });

      await _extractOperations('remove o sofa', 'Room: 4m x 6m. Items: Sofa, Mesa');
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: [
            expect.objectContaining({
              content: expect.stringContaining('Room: 4m x 6m'),
            }),
          ],
        }),
      );
    });
  });

  describe('sendMessage', () => {
    it('should send message, extract ops, enqueue job and return 202 data', async () => {
      // Mock project ownership check
      mockFrom.mockReturnValue(mockChain({ data: { id: PROJECT_ID }, error: null }));

      // Mock spatial input lookup
      let adminCallCount = 0;
      mockAdminFrom.mockImplementation(() => {
        adminCallCount++;
        if (adminCallCount === 1) {
          // spatial_inputs query
          return mockChain({
            data: { dimensions: { width: 4, length: 6 }, items: [{ name: 'Sofa' }] },
            error: null,
          });
        }
        if (adminCallCount === 2) {
          // chat_messages insert
          return mockChain({
            data: { id: 'msg-1', project_id: PROJECT_ID, role: 'user', content: 'tira o tapete' },
            error: null,
          });
        }
        // render_jobs insert
        return mockChain({
          data: { id: 'job-1', project_id: PROJECT_ID, type: 'refinement', status: 'queued' },
          error: null,
        });
      });

      mockCreate.mockResolvedValue({
        content: [{ type: 'text', text: '[{"type":"remove","target":"tapete","params":{}}]' }],
      });

      const result = await chatService.sendMessage(PROJECT_ID, USER_ID, 'tira o tapete', TOKEN);

      expect(result.chat_message_id).toBe('msg-1');
      expect(result.job_id).toBe('job-1');
      expect(result.operations).toHaveLength(1);
      expect(result.operations[0].type).toBe('remove');
    });

    it('should throw 403 when project not owned by user', async () => {
      mockFrom.mockReturnValue(mockChain({ data: null, error: null }));

      try {
        await chatService.sendMessage(PROJECT_ID, USER_ID, 'tira o tapete', TOKEN);
        expect.unreachable('Should have thrown');
      } catch (err) {
        expect((err as AppError).code).toBe('PROJECT_NOT_FOUND');
        expect((err as AppError).statusCode).toBe(403);
      }
    });
  });

  describe('getHistory', () => {
    it('should return chat messages ordered by created_at ASC', async () => {
      mockFrom.mockReturnValue(mockChain({ data: { id: PROJECT_ID }, error: null }));

      const messages = [
        { id: 'msg-1', content: 'tira o tapete', created_at: '2026-01-01T00:00:00Z' },
        { id: 'msg-2', content: 'muda a cor', created_at: '2026-01-01T00:01:00Z' },
      ];

      mockAdminFrom.mockReturnValue(mockArrayChain({ data: messages, error: null }));

      const result = await chatService.getHistory(PROJECT_ID, USER_ID, TOKEN, 50);
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('msg-1');
    });

    it('should support cursor-based pagination', async () => {
      mockFrom.mockReturnValue(mockChain({ data: { id: PROJECT_ID }, error: null }));

      const adminChain = mockArrayChain({ data: [{ id: 'msg-3' }], error: null });
      mockAdminFrom.mockReturnValue(adminChain);

      await chatService.getHistory(PROJECT_ID, USER_ID, TOKEN, 50, '2026-01-01T00:00:00Z');
      expect(adminChain.gt).toHaveBeenCalledWith('created_at', '2026-01-01T00:00:00Z');
    });

    it('should throw 403 for unauthorized project', async () => {
      mockFrom.mockReturnValue(mockChain({ data: null, error: null }));

      try {
        await chatService.getHistory(PROJECT_ID, USER_ID, TOKEN, 50);
        expect.unreachable('Should have thrown');
      } catch (err) {
        expect((err as AppError).code).toBe('PROJECT_NOT_FOUND');
        expect((err as AppError).statusCode).toBe(403);
      }
    });
  });
});
