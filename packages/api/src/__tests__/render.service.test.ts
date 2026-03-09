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

vi.mock('../lib/supabase', () => ({
  supabaseAdmin: {
    from: vi.fn(),
  },
  createUserClient: vi.fn(),
}));

vi.mock('../lib/redis', () => ({
  redisHealthCheck: vi.fn(),
  getRedisClient: vi.fn(),
}));

vi.mock('../services/quota.service', () => ({
  quotaService: {
    enforceQuota: vi.fn(),
  },
}));

vi.mock('../queue/render.queue', () => ({
  enqueueRenderJob: vi.fn(),
  removeQueueJob: vi.fn(),
}));

vi.mock('../queue/render.events', () => ({
  renderEvents: {
    broadcast: vi.fn(),
  },
}));

import { renderService } from '../services/render.service';
import { redisHealthCheck } from '../lib/redis';
import { supabaseAdmin, createUserClient } from '../lib/supabase';
import { quotaService } from '../services/quota.service';
import { enqueueRenderJob, removeQueueJob } from '../queue/render.queue';
import { renderEvents } from '../queue/render.events';

const mockRedisHealthCheck = vi.mocked(redisHealthCheck);
const mockEnforceQuota = vi.mocked(quotaService.enforceQuota);
const mockEnqueue = vi.mocked(enqueueRenderJob);
const mockRemoveQueue = vi.mocked(removeQueueJob);
const mockBroadcast = vi.mocked(renderEvents.broadcast);
const mockSupabaseFrom = vi.mocked(supabaseAdmin.from);
const mockCreateUserClient = vi.mocked(createUserClient);

const buildChain = () => {
  const chain: Record<string, ReturnType<typeof vi.fn>> = {};
  chain.select = vi.fn().mockReturnValue(chain);
  chain.eq = vi.fn().mockReturnValue(chain);
  chain.insert = vi.fn().mockReturnValue(chain);
  chain.update = vi.fn().mockReturnValue(chain);
  chain.order = vi.fn().mockReturnValue(chain);
  chain.single = vi.fn();
  return chain;
};

describe('render service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createJob', () => {
    const input = {
      projectId: 'proj-1',
      userId: 'user-1',
      type: 'initial' as const,
      inputParams: { style: 'modern' },
      accessToken: 'token-123',
    };

    it('should throw QUEUE_UNAVAILABLE when Redis is down', async () => {
      mockRedisHealthCheck.mockResolvedValue(false);

      await expect(renderService.createJob(input)).rejects.toMatchObject({
        code: 'QUEUE_UNAVAILABLE',
        statusCode: 503,
      });
    });

    it('should throw PROJECT_NOT_FOUND when project does not exist', async () => {
      mockRedisHealthCheck.mockResolvedValue(true);

      const clientChain = buildChain();
      clientChain.single.mockResolvedValue({ data: null, error: { message: 'not found' } });
      const userClient = { from: vi.fn().mockReturnValue(clientChain) };
      mockCreateUserClient.mockReturnValue(userClient as never);

      await expect(renderService.createJob(input)).rejects.toMatchObject({
        code: 'PROJECT_NOT_FOUND',
        statusCode: 404,
      });
    });

    it('should create job and enqueue when all checks pass', async () => {
      mockRedisHealthCheck.mockResolvedValue(true);

      // Mock project ownership check
      const clientChain = buildChain();
      clientChain.single.mockResolvedValue({ data: { id: 'proj-1' }, error: null });
      const userClient = { from: vi.fn().mockReturnValue(clientChain) };
      mockCreateUserClient.mockReturnValue(userClient as never);

      // Mock quota
      mockEnforceQuota.mockResolvedValue({
        allowed: true,
        renders_used: 1,
        renders_limit: 3,
        remaining: 2,
        tier: 'free',
      });

      // Mock supabaseAdmin.from calls: first spatial_inputs (approval check), then render_jobs (insert)
      let adminCallCount = 0;
      mockSupabaseFrom.mockImplementation(() => {
        adminCallCount++;
        if (adminCallCount === 1) {
          // Croqui approval check
          const spatialChain = buildChain();
          spatialChain.single.mockResolvedValue({
            data: { croqui_approved: true },
            error: null,
          });
          return spatialChain as never;
        }
        // DB insert for render job
        const insertChain = buildChain();
        insertChain.single.mockResolvedValue({
          data: {
            id: 'render-job-1',
            project_id: 'proj-1',
            type: 'initial',
            status: 'queued',
            priority: 10,
          },
          error: null,
        });
        return insertChain as never;
      });

      mockEnqueue.mockResolvedValue('render-job-1');

      const result = await renderService.createJob(input);

      expect(result.id).toBe('render-job-1');
      expect(result.status).toBe('queued');
      expect(mockEnqueue).toHaveBeenCalled();
    });

    it('should throw CROQUI_NOT_APPROVED when croqui is not approved', async () => {
      mockRedisHealthCheck.mockResolvedValue(true);

      // Mock project ownership check
      const clientChain = buildChain();
      clientChain.single.mockResolvedValue({ data: { id: 'proj-1' }, error: null });
      const userClient = { from: vi.fn().mockReturnValue(clientChain) };
      mockCreateUserClient.mockReturnValue(userClient as never);

      // Mock spatial_inputs - croqui not approved
      const spatialChain = buildChain();
      spatialChain.single.mockResolvedValue({
        data: { croqui_approved: false },
        error: null,
      });
      mockSupabaseFrom.mockReturnValue(spatialChain as never);

      await expect(renderService.createJob(input)).rejects.toMatchObject({
        code: 'CROQUI_NOT_APPROVED',
        statusCode: 409,
      });
    });
  });

  describe('listJobs', () => {
    it('should return jobs for a project', async () => {
      // Mock project ownership
      const clientChain = buildChain();
      clientChain.single.mockResolvedValue({ data: { id: 'proj-1' }, error: null });
      const userClient = { from: vi.fn().mockReturnValue(clientChain) };
      mockCreateUserClient.mockReturnValue(userClient as never);

      // Mock render jobs list
      const jobsChain = buildChain();
      jobsChain.order.mockResolvedValue({
        data: [
          { id: 'job-1', status: 'completed' },
          { id: 'job-2', status: 'queued' },
        ],
        error: null,
      });
      mockSupabaseFrom.mockReturnValue(jobsChain as never);

      const jobs = await renderService.listJobs('proj-1', 'user-1', 'token-123');

      expect(jobs).toHaveLength(2);
      expect(jobs[0].id).toBe('job-1');
    });

    it('should throw PROJECT_NOT_FOUND when project not found', async () => {
      const clientChain = buildChain();
      clientChain.single.mockResolvedValue({ data: null, error: { message: 'not found' } });
      const userClient = { from: vi.fn().mockReturnValue(clientChain) };
      mockCreateUserClient.mockReturnValue(userClient as never);

      await expect(
        renderService.listJobs('proj-999', 'user-1', 'token-123'),
      ).rejects.toMatchObject({
        code: 'PROJECT_NOT_FOUND',
        statusCode: 404,
      });
    });
  });

  describe('cancelJob', () => {
    it('should cancel a queued job', async () => {
      // Mock get job from supabase
      const jobChain = buildChain();
      jobChain.single.mockResolvedValue({
        data: { id: 'job-1', project_id: 'proj-1', status: 'queued' },
        error: null,
      });

      // Mock update
      const updateChain = buildChain();
      updateChain.eq.mockResolvedValue({ error: null });

      let supaCallCount = 0;
      mockSupabaseFrom.mockImplementation(() => {
        supaCallCount++;
        if (supaCallCount === 1) return jobChain as never;
        return updateChain as never;
      });

      // Mock project ownership
      const clientChain = buildChain();
      clientChain.single.mockResolvedValue({ data: { id: 'proj-1' }, error: null });
      const userClient = { from: vi.fn().mockReturnValue(clientChain) };
      mockCreateUserClient.mockReturnValue(userClient as never);

      mockRemoveQueue.mockResolvedValue(true);
      mockBroadcast.mockResolvedValue(undefined);

      const result = await renderService.cancelJob('job-1', 'user-1', 'token-123');

      expect(result.status).toBe('canceled');
      expect(mockRemoveQueue).toHaveBeenCalledWith('job-1');
      expect(mockBroadcast).toHaveBeenCalledWith({
        jobId: 'job-1',
        status: 'canceled',
      });
    });

    it('should throw when job not found', async () => {
      const jobChain = buildChain();
      jobChain.single.mockResolvedValue({ data: null, error: { message: 'not found' } });
      mockSupabaseFrom.mockReturnValue(jobChain as never);

      await expect(
        renderService.cancelJob('job-999', 'user-1', 'token-123'),
      ).rejects.toMatchObject({
        code: 'RENDER_JOB_NOT_FOUND',
        statusCode: 404,
      });
    });

    it('should throw when job is not cancelable', async () => {
      const jobChain = buildChain();
      jobChain.single.mockResolvedValue({
        data: { id: 'job-1', project_id: 'proj-1', status: 'completed' },
        error: null,
      });
      mockSupabaseFrom.mockReturnValue(jobChain as never);

      // Mock project ownership
      const clientChain = buildChain();
      clientChain.single.mockResolvedValue({ data: { id: 'proj-1' }, error: null });
      const userClient = { from: vi.fn().mockReturnValue(clientChain) };
      mockCreateUserClient.mockReturnValue(userClient as never);

      await expect(
        renderService.cancelJob('job-1', 'user-1', 'token-123'),
      ).rejects.toMatchObject({
        code: 'RENDER_JOB_NOT_CANCELABLE',
        statusCode: 409,
      });
    });
  });
});
