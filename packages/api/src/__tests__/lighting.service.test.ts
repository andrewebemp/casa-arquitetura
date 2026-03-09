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
    storage: { from: vi.fn() },
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
}));

vi.mock('../queue/render.events', () => ({
  renderEvents: {
    broadcast: vi.fn(),
  },
}));

vi.mock('../services/ic-light.client', () => ({
  icLightClient: {
    enhanceLighting: vi.fn(),
    getPromptForMode: vi.fn(),
  },
}));

import { lightingService } from '../services/lighting.service';
import { supabaseAdmin, createUserClient } from '../lib/supabase';
import { redisHealthCheck } from '../lib/redis';
import { quotaService } from '../services/quota.service';
import { enqueueRenderJob } from '../queue/render.queue';
import { renderEvents } from '../queue/render.events';
import { icLightClient } from '../services/ic-light.client';

const mockSupabaseFrom = vi.mocked(supabaseAdmin.from);
const mockCreateUserClient = vi.mocked(createUserClient);
const mockRedisHealthCheck = vi.mocked(redisHealthCheck);
const mockEnforceQuota = vi.mocked(quotaService.enforceQuota);
const mockEnqueue = vi.mocked(enqueueRenderJob);
const mockBroadcast = vi.mocked(renderEvents.broadcast);
const mockEnhanceLighting = vi.mocked(icLightClient.enhanceLighting);

const buildChain = () => {
  const chain: Record<string, ReturnType<typeof vi.fn>> = {};
  chain.select = vi.fn().mockReturnValue(chain);
  chain.eq = vi.fn().mockReturnValue(chain);
  chain.insert = vi.fn().mockReturnValue(chain);
  chain.update = vi.fn().mockReturnValue(chain);
  chain.order = vi.fn().mockReturnValue(chain);
  chain.limit = vi.fn().mockReturnValue(chain);
  chain.single = vi.fn();
  return chain;
};

describe('lighting-service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock estimateBrightnessFromUrl to avoid actual fetch
    vi.spyOn(lightingService, 'estimateBrightnessFromUrl').mockResolvedValue(30);
  });

  describe('analyzeLighting', () => {
    const baseInput = {
      projectId: 'proj-1',
      userId: 'user-1',
      imageVersionId: 'v-1',
      mode: 'auto' as const,
      autoEnhance: false,
      accessToken: 'token-123',
    };

    it('should throw 403 when project not owned by user', async () => {
      const clientChain = buildChain();
      clientChain.single.mockResolvedValue({ data: null, error: { message: 'not found' } });
      const userClient = { from: vi.fn().mockReturnValue(clientChain) };
      mockCreateUserClient.mockReturnValue(userClient as never);

      await expect(lightingService.analyzeLighting(baseInput)).rejects.toMatchObject({
        code: 'PROJECT_NOT_FOUND',
        statusCode: 403,
      });
    });

    it('should throw 404 when version not found', async () => {
      // Mock project ownership
      const clientChain = buildChain();
      clientChain.single.mockResolvedValue({ data: { id: 'proj-1' }, error: null });
      const userClient = { from: vi.fn().mockReturnValue(clientChain) };
      mockCreateUserClient.mockReturnValue(userClient as never);

      // Mock version not found
      const versionChain = buildChain();
      versionChain.single.mockResolvedValue({ data: null, error: { message: 'not found' } });
      mockSupabaseFrom.mockReturnValue(versionChain as never);

      await expect(lightingService.analyzeLighting(baseInput)).rejects.toMatchObject({
        code: 'VERSION_NOT_FOUND',
        statusCode: 404,
      });
    });

    it('should return assessment without job when autoEnhance is false', async () => {
      // Mock project ownership
      const clientChain = buildChain();
      clientChain.single.mockResolvedValue({ data: { id: 'proj-1' }, error: null });
      const userClient = { from: vi.fn().mockReturnValue(clientChain) };
      mockCreateUserClient.mockReturnValue(userClient as never);

      // Mock version found
      const versionChain = buildChain();
      versionChain.single.mockResolvedValue({
        data: {
          id: 'v-1',
          version_number: 1,
          image_url: 'https://storage.com/render.jpg',
          metadata: {},
        },
        error: null,
      });
      mockSupabaseFrom.mockReturnValue(versionChain as never);

      const result = await lightingService.analyzeLighting(baseInput);

      expect(result.assessment.brightness_score).toBe(30);
      expect(result.assessment.exposure_level).toBe('underexposed');
      expect(result.assessment.needs_enhancement).toBe(true);
      expect(result.job_id).toBeNull();
      expect(result.status).toBe('analysis_complete');
    });

    it('should create job when autoEnhance is true and image needs enhancement', async () => {
      // Mock project ownership
      const clientChain = buildChain();
      clientChain.single.mockResolvedValue({ data: { id: 'proj-1' }, error: null });
      const userClient = { from: vi.fn().mockReturnValue(clientChain) };
      mockCreateUserClient.mockReturnValue(userClient as never);

      // Mock version found + redis + quota + job insert
      let adminCallCount = 0;
      mockSupabaseFrom.mockImplementation(() => {
        adminCallCount++;
        if (adminCallCount === 1) {
          // project_versions select
          const versionChain = buildChain();
          versionChain.single.mockResolvedValue({
            data: {
              id: 'v-1',
              version_number: 1,
              image_url: 'https://storage.com/render.jpg',
              metadata: {},
            },
            error: null,
          });
          return versionChain as never;
        }
        // render_jobs insert
        const insertChain = buildChain();
        insertChain.single.mockResolvedValue({
          data: {
            id: 'light-job-1',
            project_id: 'proj-1',
            type: 'lighting_enhancement',
            status: 'queued',
            priority: 10,
            input_params: {
              image_url: 'https://storage.com/render.jpg',
              image_version_id: 'v-1',
              base_version_number: 1,
              mode: 'auto',
              original_brightness: 30,
            },
          },
          error: null,
        });
        return insertChain as never;
      });

      mockRedisHealthCheck.mockResolvedValue(true);
      mockEnforceQuota.mockResolvedValue({
        allowed: true,
        renders_used: 1,
        renders_limit: 3,
        remaining: 2,
        tier: 'free',
      });
      mockEnqueue.mockResolvedValue('light-job-1');

      const result = await lightingService.analyzeLighting({
        ...baseInput,
        autoEnhance: true,
      });

      expect(result.job_id).toBe('light-job-1');
      expect(result.status).toBe('queued');
      expect(mockEnqueue).toHaveBeenCalled();
    });
  });

  describe('processLightingJob', () => {
    it('should process pipeline and create version', async () => {
      const inputParams = {
        image_url: 'https://storage.com/render.jpg',
        mode: 'auto',
        original_brightness: 25,
        base_version_number: 1,
      };

      let adminCallCount = 0;
      mockSupabaseFrom.mockImplementation(() => {
        adminCallCount++;
        if (adminCallCount === 1) {
          // render_jobs select
          const jobChain = buildChain();
          jobChain.single.mockResolvedValue({ data: { project_id: 'proj-1' }, error: null });
          return jobChain as never;
        }
        if (adminCallCount === 2) {
          // project_versions insert
          const insertChain = buildChain();
          insertChain.single.mockResolvedValue({
            data: { id: 'v-2', version_number: 2 },
            error: null,
          });
          return insertChain as never;
        }
        // render_jobs update
        const updateChain = buildChain();
        updateChain.eq.mockResolvedValue({ error: null });
        return updateChain as never;
      });

      mockEnhanceLighting.mockResolvedValue({
        result_image_url: 'https://fal.ai/enhanced.jpg',
        metadata: {
          model: 'ic-light-v2',
          inference_time_ms: 5000,
          provider: 'fal.ai',
          lighting_mode: 'auto',
          prompt_used: 'Professional real estate photography lighting',
        },
      });

      vi.spyOn(lightingService, 'estimateBrightnessFromUrl').mockResolvedValue(65);
      mockBroadcast.mockResolvedValue(undefined);

      const result = await lightingService.processLightingJob('light-job-1', inputParams);

      expect(result.result_url).toBe('https://fal.ai/enhanced.jpg');
      expect(result.version_id).toBe('v-2');
      expect(result.generation_time_ms).toBeGreaterThanOrEqual(0);
      expect(mockBroadcast).toHaveBeenCalledWith(
        expect.objectContaining({ jobId: 'light-job-1', progress: 20 }),
      );
      expect(mockBroadcast).toHaveBeenCalledWith(
        expect.objectContaining({ jobId: 'light-job-1', progress: 50 }),
      );
      expect(mockBroadcast).toHaveBeenCalledWith(
        expect.objectContaining({ jobId: 'light-job-1', progress: 75 }),
      );
      expect(mockBroadcast).toHaveBeenCalledWith(
        expect.objectContaining({ jobId: 'light-job-1', progress: 100, status: 'completed' }),
      );
    });

    it('should throw when render job not found', async () => {
      const jobChain = buildChain();
      jobChain.single.mockResolvedValue({ data: null, error: null });
      mockSupabaseFrom.mockReturnValue(jobChain as never);

      await expect(
        lightingService.processLightingJob('bad-job', { image_url: 'url', mode: 'auto' }),
      ).rejects.toMatchObject({
        code: 'RENDER_JOB_NOT_FOUND',
        statusCode: 404,
      });
    });
  });
});
