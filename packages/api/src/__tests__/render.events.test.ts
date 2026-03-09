import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockSend, mockChannel } = vi.hoisted(() => {
  const mockSend = vi.fn();
  const mockChannel = vi.fn().mockReturnValue({ send: mockSend });
  return { mockSend, mockChannel };
});

vi.mock('../lib/supabase', () => ({
  supabaseAdmin: {
    channel: mockChannel,
  },
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

import { renderEvents } from '../queue/render.events';

describe('render events', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSend.mockResolvedValue(undefined);
  });

  describe('broadcast', () => {
    it('should broadcast status change to correct channel', async () => {
      await renderEvents.broadcast({
        jobId: 'job-123',
        status: 'processing',
        progress: 50,
      });

      expect(mockChannel).toHaveBeenCalledWith('render:job-123');
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'broadcast',
          event: 'status_change',
          payload: expect.objectContaining({
            job_id: 'job-123',
            status: 'processing',
            progress: 50,
          }),
        }),
      );
    });

    it('should broadcast failure with error message', async () => {
      await renderEvents.broadcast({
        jobId: 'job-456',
        status: 'failed',
        error_message: 'GPU error',
      });

      expect(mockChannel).toHaveBeenCalledWith('render:job-456');
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          payload: expect.objectContaining({
            status: 'failed',
            error_message: 'GPU error',
          }),
        }),
      );
    });

    it('should not throw on broadcast failure', async () => {
      mockSend.mockRejectedValue(new Error('Realtime down'));

      await expect(
        renderEvents.broadcast({ jobId: 'job-789', status: 'completed' }),
      ).resolves.not.toThrow();
    });
  });
});
