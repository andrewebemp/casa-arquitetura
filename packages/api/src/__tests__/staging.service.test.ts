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
    storage: {
      from: vi.fn(),
    },
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

vi.mock('../services/storage.service', () => ({
  storageService: {
    validateFile: vi.fn(),
    upload: vi.fn(),
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

vi.mock('../lib/ai-pipeline.client', () => ({
  aiPipelineClient: {
    analyzeDepth: vi.fn(),
    analyzeStyle: vi.fn(),
    generate: vi.fn(),
  },
}));

import { stagingService } from '../services/staging.service';
import { redisHealthCheck } from '../lib/redis';
import { supabaseAdmin, createUserClient } from '../lib/supabase';
import { quotaService } from '../services/quota.service';
import { storageService } from '../services/storage.service';
import { enqueueRenderJob } from '../queue/render.queue';
import { renderEvents } from '../queue/render.events';
import { aiPipelineClient } from '../lib/ai-pipeline.client';

const mockRedisHealthCheck = vi.mocked(redisHealthCheck);
const mockEnforceQuota = vi.mocked(quotaService.enforceQuota);
const mockValidateFile = vi.mocked(storageService.validateFile);
const mockUpload = vi.mocked(storageService.upload);
const mockEnqueue = vi.mocked(enqueueRenderJob);
const mockBroadcast = vi.mocked(renderEvents.broadcast);
const mockSupabaseFrom = vi.mocked(supabaseAdmin.from);
const mockStorageFrom = vi.mocked(supabaseAdmin.storage.from);
const mockCreateUserClient = vi.mocked(createUserClient);
const mockAnalyzeDepth = vi.mocked(aiPipelineClient.analyzeDepth);
const mockAnalyzeStyle = vi.mocked(aiPipelineClient.analyzeStyle);
const mockGenerate = vi.mocked(aiPipelineClient.generate);

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

describe('staging service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generate', () => {
    const baseInput = {
      projectId: 'proj-1',
      userId: 'user-1',
      styleId: 'moderno' as const,
      fileBuffer: Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10]),
      fileMimeType: 'image/jpeg',
      accessToken: 'token-123',
    };

    it('should throw QUEUE_UNAVAILABLE when Redis is down', async () => {
      mockRedisHealthCheck.mockResolvedValue(false);

      await expect(stagingService.generate(baseInput)).rejects.toMatchObject({
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

      await expect(stagingService.generate(baseInput)).rejects.toMatchObject({
        code: 'PROJECT_NOT_FOUND',
        statusCode: 404,
      });
    });

    it('should create staging job and return 202 data when all checks pass', async () => {
      mockRedisHealthCheck.mockResolvedValue(true);

      // Mock project ownership
      const clientChain = buildChain();
      clientChain.single.mockResolvedValue({
        data: { id: 'proj-1', original_image_url: 'https://example.com/photo.jpg' },
        error: null,
      });
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

      // Mock file validation
      mockValidateFile.mockReturnValue(undefined);

      // Mock upload
      mockUpload.mockResolvedValue({
        image_url: 'https://storage.com/photo.jpg',
        file_size: 1024,
        mime_type: 'image/jpeg',
      });

      // Mock render job insert
      const insertChain = buildChain();
      insertChain.single.mockResolvedValue({
        data: {
          id: 'render-job-1',
          project_id: 'proj-1',
          type: 'initial',
          status: 'queued',
          priority: 10,
          input_params: {
            style_id: 'moderno',
            photo_url: 'https://storage.com/photo.jpg',
            photo_hash: 'abc',
            resolution: '1024x1024',
            prompt_modifier: 'modern interior...',
            negative_prompt: 'cluttered...',
          },
        },
        error: null,
      });
      mockSupabaseFrom.mockReturnValue(insertChain as never);

      mockEnqueue.mockResolvedValue('render-job-1');

      const result = await stagingService.generate(baseInput);

      expect(result.job_id).toBe('render-job-1');
      expect(result.status).toBe('queued');
      expect(result.style_id).toBe('moderno');
      expect(result.resolution).toBe('1024x1024');
      expect(mockEnqueue).toHaveBeenCalled();
    });

    it('should use 2048x2048 resolution for pro tier', async () => {
      mockRedisHealthCheck.mockResolvedValue(true);

      const clientChain = buildChain();
      clientChain.single.mockResolvedValue({
        data: { id: 'proj-1', original_image_url: null },
        error: null,
      });
      const userClient = { from: vi.fn().mockReturnValue(clientChain) };
      mockCreateUserClient.mockReturnValue(userClient as never);

      mockEnforceQuota.mockResolvedValue({
        allowed: true,
        renders_used: 1,
        renders_limit: 100,
        remaining: 99,
        tier: 'pro',
      });

      mockValidateFile.mockReturnValue(undefined);
      mockUpload.mockResolvedValue({
        image_url: 'https://storage.com/photo.jpg',
        file_size: 1024,
        mime_type: 'image/jpeg',
      });

      const insertChain = buildChain();
      insertChain.single.mockResolvedValue({
        data: {
          id: 'render-job-2',
          project_id: 'proj-1',
          type: 'initial',
          status: 'queued',
          priority: 5,
          input_params: {},
        },
        error: null,
      });
      mockSupabaseFrom.mockReturnValue(insertChain as never);
      mockEnqueue.mockResolvedValue('render-job-2');

      const result = await stagingService.generate(baseInput);

      expect(result.resolution).toBe('2048x2048');
    });
  });

  describe('variation', () => {
    const baseInput = {
      projectId: 'proj-1',
      userId: 'user-1',
      styleId: 'industrial' as const,
      accessToken: 'token-123',
    };

    it('should throw QUEUE_UNAVAILABLE when Redis is down', async () => {
      mockRedisHealthCheck.mockResolvedValue(false);

      await expect(stagingService.variation(baseInput)).rejects.toMatchObject({
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

      await expect(stagingService.variation(baseInput)).rejects.toMatchObject({
        code: 'PROJECT_NOT_FOUND',
        statusCode: 404,
      });
    });

    it('should throw NO_EXISTING_RENDER when no versions exist', async () => {
      mockRedisHealthCheck.mockResolvedValue(true);

      // Mock project ownership
      const clientChain = buildChain();
      clientChain.single.mockResolvedValue({
        data: { id: 'proj-1', original_image_url: 'https://example.com/photo.jpg' },
        error: null,
      });
      const userClient = { from: vi.fn().mockReturnValue(clientChain) };
      mockCreateUserClient.mockReturnValue(userClient as never);

      // Mock no existing versions
      const versionChain = buildChain();
      versionChain.single.mockResolvedValue({ data: null, error: { message: 'not found' } });
      mockSupabaseFrom.mockReturnValue(versionChain as never);

      await expect(stagingService.variation(baseInput)).rejects.toMatchObject({
        code: 'NO_EXISTING_RENDER',
        statusCode: 409,
      });
    });

    it('should create variation job reusing depth map when available', async () => {
      mockRedisHealthCheck.mockResolvedValue(true);

      // Mock project ownership
      const clientChain = buildChain();
      clientChain.single.mockResolvedValue({
        data: { id: 'proj-1', original_image_url: 'https://example.com/photo.jpg' },
        error: null,
      });
      const userClient = { from: vi.fn().mockReturnValue(clientChain) };
      mockCreateUserClient.mockReturnValue(userClient as never);

      // Mock existing version with depth map
      let adminCallCount = 0;
      mockSupabaseFrom.mockImplementation(() => {
        adminCallCount++;
        if (adminCallCount === 1) {
          // project_versions query
          const versionChain = buildChain();
          versionChain.single.mockResolvedValue({
            data: {
              metadata: {
                depth_map_url: 'https://storage.com/depth.png',
                photo_hash: 'abc123',
              },
              image_url: 'https://storage.com/result.jpg',
            },
            error: null,
          });
          return versionChain as never;
        }
        // render_jobs insert
        const insertChain = buildChain();
        insertChain.single.mockResolvedValue({
          data: {
            id: 'variation-job-1',
            project_id: 'proj-1',
            type: 'style_change',
            status: 'queued',
            priority: 10,
            input_params: {
              is_variation: true,
              depth_map_url: 'https://storage.com/depth.png',
            },
          },
          error: null,
        });
        return insertChain as never;
      });

      mockEnforceQuota.mockResolvedValue({
        allowed: true,
        renders_used: 1,
        renders_limit: 3,
        remaining: 2,
        tier: 'free',
      });

      mockEnqueue.mockResolvedValue('variation-job-1');

      const result = await stagingService.variation(baseInput);

      expect(result.job_id).toBe('variation-job-1');
      expect(result.style_id).toBe('industrial');
      expect(result.reused_depth_map).toBe(true);
      expect(mockEnqueue).toHaveBeenCalled();
    });
  });

  describe('processJob', () => {
    it('should execute full pipeline and create version', async () => {
      const inputParams = {
        photo_url: 'https://storage.com/photo.jpg',
        style_id: 'moderno',
        photo_hash: 'abc123',
        resolution: '1024x1024',
        prompt_modifier: 'modern interior design',
        negative_prompt: 'cluttered',
      };

      // Mock render job lookup
      let adminCallCount = 0;
      mockSupabaseFrom.mockImplementation(() => {
        adminCallCount++;
        if (adminCallCount === 1) {
          // render_jobs select
          const jobChain = buildChain();
          jobChain.single.mockResolvedValue({
            data: { project_id: 'proj-1' },
            error: null,
          });
          return jobChain as never;
        }
        if (adminCallCount === 2) {
          // project_versions select (latest version number)
          const versionChain = buildChain();
          versionChain.limit.mockResolvedValue({
            data: [{ version_number: 2 }],
            error: null,
          });
          return versionChain as never;
        }
        if (adminCallCount === 3) {
          // project_versions insert
          const insertChain = buildChain();
          insertChain.single.mockResolvedValue({
            data: { id: 'version-3', version_number: 3 },
            error: null,
          });
          return insertChain as never;
        }
        // render_jobs update
        const updateChain = buildChain();
        updateChain.eq.mockResolvedValue({ error: null });
        return updateChain as never;
      });

      // Mock storage for depth map cache check
      mockStorageFrom.mockReturnValue({
        createSignedUrl: vi.fn().mockResolvedValue({ data: null, error: { message: 'not found' } }),
      } as never);

      // Mock AI pipeline calls
      mockAnalyzeDepth.mockResolvedValue({
        depth_map_url: 'https://pipeline.com/depth.png',
        estimated_dimensions: { width_m: 5, length_m: 4, height_m: 3 },
        detected_features: [],
        provider: 'fal',
        inference_time_ms: 1200,
      });

      mockAnalyzeStyle.mockResolvedValue({
        style_prompt: 'modern interior',
        negative_prompt: 'cluttered',
        clip_embeddings: [0.1, 0.2],
        controlnet_params: {
          depth_strength: 0.8,
          edge_strength: 0.5,
          guidance_scale: 7.5,
          num_inference_steps: 30,
        },
        provider: 'fal',
        inference_time_ms: 500,
      });

      mockGenerate.mockResolvedValue({
        result_image_url: 'https://pipeline.com/result.jpg',
        metadata: {
          model: 'sdxl-1.0',
          inference_time_ms: 8000,
          provider: 'fal',
          upscaled: false,
        },
      });

      mockBroadcast.mockResolvedValue(undefined);

      const result = await stagingService.processJob('job-1', inputParams);

      expect(result.result_url).toBe('https://pipeline.com/result.jpg');
      expect(result.version_id).toBe('version-3');
      expect(result.generation_time_ms).toBeGreaterThanOrEqual(0);

      // Verify pipeline stages were called
      expect(mockAnalyzeDepth).toHaveBeenCalledWith('https://storage.com/photo.jpg');
      expect(mockAnalyzeStyle).toHaveBeenCalledWith('moderno');
      expect(mockGenerate).toHaveBeenCalled();

      // Verify progress broadcasts
      expect(mockBroadcast).toHaveBeenCalledWith(
        expect.objectContaining({ jobId: 'job-1', progress: 25 }),
      );
      expect(mockBroadcast).toHaveBeenCalledWith(
        expect.objectContaining({ jobId: 'job-1', progress: 50 }),
      );
      expect(mockBroadcast).toHaveBeenCalledWith(
        expect.objectContaining({ jobId: 'job-1', progress: 75 }),
      );
      expect(mockBroadcast).toHaveBeenCalledWith(
        expect.objectContaining({ jobId: 'job-1', progress: 100, status: 'completed' }),
      );
    });

    it('should reuse existing depth map when provided', async () => {
      const inputParams = {
        photo_url: 'https://storage.com/photo.jpg',
        style_id: 'industrial',
        photo_hash: 'abc123',
        resolution: '2048x2048',
        prompt_modifier: 'industrial interior design',
        negative_prompt: 'colorful',
        depth_map_url: 'https://storage.com/existing-depth.png',
      };

      // Mock render job lookup
      let adminCallCount = 0;
      mockSupabaseFrom.mockImplementation(() => {
        adminCallCount++;
        if (adminCallCount === 1) {
          const jobChain = buildChain();
          jobChain.single.mockResolvedValue({
            data: { project_id: 'proj-1' },
            error: null,
          });
          return jobChain as never;
        }
        if (adminCallCount === 2) {
          const versionChain = buildChain();
          versionChain.limit.mockResolvedValue({
            data: [],
            error: null,
          });
          return versionChain as never;
        }
        if (adminCallCount === 3) {
          const insertChain = buildChain();
          insertChain.single.mockResolvedValue({
            data: { id: 'version-1', version_number: 1 },
            error: null,
          });
          return insertChain as never;
        }
        const updateChain = buildChain();
        updateChain.eq.mockResolvedValue({ error: null });
        return updateChain as never;
      });

      mockAnalyzeStyle.mockResolvedValue({
        style_prompt: 'industrial interior',
        negative_prompt: 'colorful',
        clip_embeddings: [0.3, 0.4],
        controlnet_params: {
          depth_strength: 0.7,
          edge_strength: 0.6,
          guidance_scale: 8.0,
          num_inference_steps: 25,
        },
        provider: 'replicate',
        inference_time_ms: 600,
      });

      mockGenerate.mockResolvedValue({
        result_image_url: 'https://pipeline.com/result2.jpg',
        metadata: {
          model: 'sdxl-1.0',
          inference_time_ms: 7000,
          provider: 'replicate',
          upscaled: false,
        },
      });

      mockBroadcast.mockResolvedValue(undefined);

      const result = await stagingService.processJob('job-2', inputParams);

      expect(result.result_url).toBe('https://pipeline.com/result2.jpg');
      // Should NOT call analyzeDepth since depth_map_url was provided
      expect(mockAnalyzeDepth).not.toHaveBeenCalled();
    });
  });

  describe('getOrCreateDepthMap', () => {
    it('should return cached depth map when available', async () => {
      mockStorageFrom.mockReturnValue({
        createSignedUrl: vi.fn().mockResolvedValue({
          data: { signedUrl: 'https://storage.com/cached-depth.png' },
          error: null,
        }),
      } as never);

      const result = await stagingService.getOrCreateDepthMap(
        'https://storage.com/photo.jpg',
        'hash123',
        'proj-1',
      );

      expect(result).toBe('https://storage.com/cached-depth.png');
      expect(mockAnalyzeDepth).not.toHaveBeenCalled();
    });

    it('should generate depth map on cache miss', async () => {
      mockStorageFrom.mockReturnValue({
        createSignedUrl: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'not found' },
        }),
      } as never);

      mockAnalyzeDepth.mockResolvedValue({
        depth_map_url: 'https://pipeline.com/new-depth.png',
        estimated_dimensions: { width_m: 5, length_m: 4, height_m: 3 },
        detected_features: [],
        provider: 'fal',
        inference_time_ms: 1500,
      });

      const result = await stagingService.getOrCreateDepthMap(
        'https://storage.com/photo.jpg',
        'hash456',
        'proj-2',
      );

      expect(result).toBe('https://pipeline.com/new-depth.png');
      expect(mockAnalyzeDepth).toHaveBeenCalledWith('https://storage.com/photo.jpg');
    });
  });
});
