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

const mockAdd = vi.fn();
const mockGetJob = vi.fn();
const mockClose = vi.fn();

vi.mock('bullmq', () => ({
  Queue: vi.fn().mockImplementation(() => ({
    add: mockAdd,
    getJob: mockGetJob,
    close: mockClose,
  })),
}));

import { getPriorityForTier, enqueueRenderJob, removeQueueJob } from '../queue/render.queue';
import type { RenderJobData } from '../queue/render.queue';

describe('render queue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getPriorityForTier', () => {
    it('should return 1 for business tier', () => {
      expect(getPriorityForTier('business')).toBe(1);
    });

    it('should return 5 for pro tier', () => {
      expect(getPriorityForTier('pro')).toBe(5);
    });

    it('should return 10 for free tier', () => {
      expect(getPriorityForTier('free')).toBe(10);
    });
  });

  describe('enqueueRenderJob', () => {
    it('should add job to queue with correct priority', async () => {
      const jobData: RenderJobData = {
        jobId: 'job-1',
        projectId: 'proj-1',
        userId: 'user-1',
        type: 'initial',
        inputParams: {},
      };

      mockAdd.mockResolvedValue({ id: 'job-1' });

      const id = await enqueueRenderJob(jobData, 'business');

      expect(mockAdd).toHaveBeenCalledWith('render-job', jobData, {
        priority: 1,
        jobId: 'job-1',
      });
      expect(id).toBe('job-1');
    });
  });

  describe('removeQueueJob', () => {
    it('should remove job from queue when found', async () => {
      const mockRemove = vi.fn().mockResolvedValue(undefined);
      mockGetJob.mockResolvedValue({ remove: mockRemove });

      const result = await removeQueueJob('job-1');

      expect(result).toBe(true);
      expect(mockRemove).toHaveBeenCalled();
    });

    it('should return false when job not found', async () => {
      mockGetJob.mockResolvedValue(null);

      const result = await removeQueueJob('job-999');

      expect(result).toBe(false);
    });
  });
});
