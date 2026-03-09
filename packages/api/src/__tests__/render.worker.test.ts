import { describe, it, expect, vi, beforeEach } from 'vitest';

const {
  mockWorkerOn,
  mockWorkerClose,
  capturedProcessor,
} = vi.hoisted(() => ({
  mockWorkerOn: vi.fn(),
  mockWorkerClose: vi.fn(),
  capturedProcessor: { fn: null as ((job: unknown) => Promise<void>) | null },
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

vi.mock('ioredis', () => ({
  default: vi.fn().mockImplementation(() => ({
    on: vi.fn(),
    ping: vi.fn().mockResolvedValue('PONG'),
    quit: vi.fn().mockResolvedValue('OK'),
  })),
}));

vi.mock('bullmq', () => ({
  Worker: vi.fn().mockImplementation((_name: string, processor: (job: unknown) => Promise<void>) => {
    capturedProcessor.fn = processor;
    return {
      on: mockWorkerOn,
      close: mockWorkerClose,
    };
  }),
}));

vi.mock('../lib/supabase', () => ({
  supabaseAdmin: {
    from: vi.fn(),
  },
}));

vi.mock('../queue/render.events', () => ({
  renderEvents: {
    broadcast: vi.fn(),
  },
}));

import { renderEvents } from '../queue/render.events';
import { supabaseAdmin } from '../lib/supabase';

const mockBroadcast = vi.mocked(renderEvents.broadcast);
const mockSupabaseFrom = vi.mocked(supabaseAdmin.from);

describe('render worker', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    capturedProcessor.fn = null;
    vi.resetModules();
  });

  describe('startRenderWorker', () => {
    it('should create a worker instance', async () => {
      const { startRenderWorker: start } = await import('../queue/render.worker');
      const worker = start();
      expect(worker).toBeDefined();
      expect(mockWorkerOn).toHaveBeenCalledWith('failed', expect.any(Function));
      expect(mockWorkerOn).toHaveBeenCalledWith('error', expect.any(Function));
    });

    it('should process job and update status through transitions', async () => {
      const { startRenderWorker: start } = await import('../queue/render.worker');
      const updateChain: Record<string, ReturnType<typeof vi.fn>> = {};
      updateChain.update = vi.fn().mockReturnValue(updateChain);
      updateChain.eq = vi.fn().mockResolvedValue({ error: null });
      mockSupabaseFrom.mockReturnValue(updateChain as never);
      mockBroadcast.mockResolvedValue(undefined);

      start();

      expect(capturedProcessor.fn).not.toBeNull();

      const mockJob = {
        data: {
          jobId: 'job-1',
          projectId: 'proj-1',
          userId: 'user-1',
          type: 'initial',
          inputParams: {},
        },
        updateProgress: vi.fn(),
      };

      await capturedProcessor.fn!(mockJob);

      expect(mockBroadcast).toHaveBeenCalledWith(
        expect.objectContaining({ jobId: 'job-1', status: 'processing' }),
      );
      expect(mockBroadcast).toHaveBeenCalledWith(
        expect.objectContaining({ jobId: 'job-1', status: 'completed', progress: 100 }),
      );
    });
  });

  describe('stopRenderWorker', () => {
    it('should close the worker', async () => {
      const { startRenderWorker: start, stopRenderWorker: stop } = await import('../queue/render.worker');
      mockWorkerClose.mockResolvedValue(undefined);
      start();
      await stop();
      expect(mockWorkerClose).toHaveBeenCalled();
    });
  });
});
