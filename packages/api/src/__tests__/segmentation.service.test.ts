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

vi.mock('../services/sam-client', () => ({
  samClient: {
    segmentByPoint: vi.fn(),
    segmentByBox: vi.fn(),
    segmentAll: vi.fn(),
  },
}));

vi.mock('../services/inpainting.service', () => ({
  inpaintingService: {
    swapMaterial: vi.fn(),
  },
}));

import { segmentationService } from '../services/segmentation.service';
import { supabaseAdmin, createUserClient } from '../lib/supabase';
import { redisHealthCheck } from '../lib/redis';
import { quotaService } from '../services/quota.service';
import { enqueueRenderJob } from '../queue/render.queue';
import { renderEvents } from '../queue/render.events';
import { samClient } from '../services/sam-client';
import { inpaintingService } from '../services/inpainting.service';

const mockSupabaseFrom = vi.mocked(supabaseAdmin.from);
const mockCreateUserClient = vi.mocked(createUserClient);
const mockRedisHealthCheck = vi.mocked(redisHealthCheck);
const mockEnforceQuota = vi.mocked(quotaService.enforceQuota);
const mockEnqueue = vi.mocked(enqueueRenderJob);
const mockBroadcast = vi.mocked(renderEvents.broadcast);
const mockSegmentByPoint = vi.mocked(samClient.segmentByPoint);
const mockSegmentAll = vi.mocked(samClient.segmentAll);
const mockSwapMaterial = vi.mocked(inpaintingService.swapMaterial);

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

const MOCK_SEGMENT = {
  segment_id: 'seg-1',
  label: 'wall',
  mask_url: 'https://storage.com/mask.png',
  polygon: [{ x: 0, y: 0 }, { x: 100, y: 0 }],
  bounding_box: { x: 0, y: 0, width: 100, height: 100 },
  confidence: 0.95,
};

describe('segmentation-service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('segmentPoint', () => {
    const baseInput = {
      projectId: 'proj-1',
      userId: 'user-1',
      x: 50,
      y: 50,
      accessToken: 'token-123',
    };

    it('should throw PROJECT_NOT_FOUND when project does not exist', async () => {
      const clientChain = buildChain();
      clientChain.single.mockResolvedValue({ data: null, error: { message: 'not found' } });
      const userClient = { from: vi.fn().mockReturnValue(clientChain) };
      mockCreateUserClient.mockReturnValue(userClient as never);

      await expect(segmentationService.segmentPoint(baseInput)).rejects.toMatchObject({
        code: 'PROJECT_NOT_FOUND',
        statusCode: 404,
      });
    });

    it('should throw NO_RENDER_AVAILABLE when no versions exist', async () => {
      // Mock project ownership
      const clientChain = buildChain();
      clientChain.single.mockResolvedValue({ data: { id: 'proj-1' }, error: null });
      const userClient = { from: vi.fn().mockReturnValue(clientChain) };
      mockCreateUserClient.mockReturnValue(userClient as never);

      // Mock no versions
      const versionChain = buildChain();
      versionChain.limit.mockResolvedValue({ data: [], error: null });
      mockSupabaseFrom.mockReturnValue(versionChain as never);

      await expect(segmentationService.segmentPoint(baseInput)).rejects.toMatchObject({
        code: 'NO_RENDER_AVAILABLE',
        statusCode: 404,
      });
    });

    it('should return classified segment on success', async () => {
      // Mock project ownership
      const clientChain = buildChain();
      clientChain.single.mockResolvedValue({ data: { id: 'proj-1' }, error: null });
      const userClient = { from: vi.fn().mockReturnValue(clientChain) };
      mockCreateUserClient.mockReturnValue(userClient as never);

      // Mock version exists
      let adminCallCount = 0;
      mockSupabaseFrom.mockImplementation(() => {
        adminCallCount++;
        if (adminCallCount === 1) {
          const versionChain = buildChain();
          versionChain.limit.mockResolvedValue({
            data: [{ image_url: 'https://storage.com/render.jpg' }],
            error: null,
          });
          return versionChain as never;
        }
        // Second call for metadata storage
        const chain = buildChain();
        chain.limit.mockResolvedValue({ data: [{ id: 'v-1' }], error: null });
        return chain as never;
      });

      mockSegmentByPoint.mockResolvedValue(MOCK_SEGMENT);

      const result = await segmentationService.segmentPoint(baseInput);

      expect(result.segment_id).toBe('seg-1');
      expect(result.category).toBe('wall');
      expect(result.mask_url).toBe('https://storage.com/mask.png');
      expect(result.confidence).toBe(0.95);
    });
  });

  describe('segmentAll', () => {
    it('should return all classified segments', async () => {
      // Mock project ownership
      const clientChain = buildChain();
      clientChain.single.mockResolvedValue({ data: { id: 'proj-1' }, error: null });
      const userClient = { from: vi.fn().mockReturnValue(clientChain) };
      mockCreateUserClient.mockReturnValue(userClient as never);

      // Mock version exists
      const versionChain = buildChain();
      versionChain.limit.mockResolvedValue({
        data: [{ image_url: 'https://storage.com/render.jpg' }],
        error: null,
      });
      mockSupabaseFrom.mockReturnValue(versionChain as never);

      mockSegmentAll.mockResolvedValue([
        MOCK_SEGMENT,
        { ...MOCK_SEGMENT, segment_id: 'seg-2', label: 'floor', confidence: 0.88 },
      ]);

      const result = await segmentationService.segmentAll({
        projectId: 'proj-1',
        userId: 'user-1',
        accessToken: 'token-123',
      });

      expect(result).toHaveLength(2);
      expect(result[0].category).toBe('wall');
      expect(result[1].category).toBe('floor');
    });
  });

  describe('applyMaterialSwap', () => {
    const baseInput = {
      projectId: 'proj-1',
      userId: 'user-1',
      segmentId: 'seg-1',
      materialDescriptor: 'dark hardwood floor',
      accessToken: 'token-123',
    };

    it('should throw QUEUE_UNAVAILABLE when Redis is down', async () => {
      mockRedisHealthCheck.mockResolvedValue(false);

      await expect(segmentationService.applyMaterialSwap(baseInput)).rejects.toMatchObject({
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

      await expect(segmentationService.applyMaterialSwap(baseInput)).rejects.toMatchObject({
        code: 'PROJECT_NOT_FOUND',
        statusCode: 404,
      });
    });

    it('should create segmentation job and enqueue when all checks pass', async () => {
      mockRedisHealthCheck.mockResolvedValue(true);

      // Mock project ownership
      const clientChain = buildChain();
      clientChain.single.mockResolvedValue({ data: { id: 'proj-1' }, error: null });
      const userClient = { from: vi.fn().mockReturnValue(clientChain) };
      mockCreateUserClient.mockReturnValue(userClient as never);

      // Mock admin calls: versions lookup, then job insert
      let adminCallCount = 0;
      mockSupabaseFrom.mockImplementation(() => {
        adminCallCount++;
        if (adminCallCount === 1) {
          const versionChain = buildChain();
          versionChain.limit.mockResolvedValue({
            data: [{
              id: 'v-1',
              version_number: 2,
              image_url: 'https://storage.com/render.jpg',
              metadata: {},
            }],
            error: null,
          });
          return versionChain as never;
        }
        // render_jobs insert
        const insertChain = buildChain();
        insertChain.single.mockResolvedValue({
          data: {
            id: 'seg-job-1',
            project_id: 'proj-1',
            type: 'segmentation',
            status: 'queued',
            priority: 10,
            input_params: {
              segment_id: 'seg-1',
              material_descriptor: 'dark hardwood floor',
              base_image_url: 'https://storage.com/render.jpg',
              base_version_id: 'v-1',
              base_version_number: 2,
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

      mockEnqueue.mockResolvedValue('seg-job-1');

      const result = await segmentationService.applyMaterialSwap(baseInput);

      expect(result.job_id).toBe('seg-job-1');
      expect(result.status).toBe('queued');
      expect(result.segment_id).toBe('seg-1');
      expect(mockEnqueue).toHaveBeenCalled();
    });
  });

  describe('processSegmentationJob', () => {
    it('should process pipeline and create version', async () => {
      const inputParams = {
        segment_id: 'seg-1',
        material_descriptor: 'white marble countertop',
        base_image_url: 'https://storage.com/render.jpg',
        base_version_number: 2,
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
            data: { id: 'v-3', version_number: 3 },
            error: null,
          });
          return insertChain as never;
        }
        // render_jobs update
        const updateChain = buildChain();
        updateChain.eq.mockResolvedValue({ error: null });
        return updateChain as never;
      });

      mockSwapMaterial.mockResolvedValue({
        result_image_url: 'https://storage.com/result.jpg',
        provider: 'fal',
        inference_time_ms: 6000,
      });

      mockBroadcast.mockResolvedValue(undefined);

      const result = await segmentationService.processSegmentationJob('seg-job-1', inputParams);

      expect(result.result_url).toBe('https://storage.com/result.jpg');
      expect(result.version_id).toBe('v-3');
      expect(result.generation_time_ms).toBeGreaterThanOrEqual(0);
      expect(mockBroadcast).toHaveBeenCalledWith(
        expect.objectContaining({ jobId: 'seg-job-1', progress: 25 }),
      );
      expect(mockBroadcast).toHaveBeenCalledWith(
        expect.objectContaining({ jobId: 'seg-job-1', progress: 100, status: 'completed' }),
      );
    });
  });

  describe('getSuggestedMaterials', () => {
    it('should return materials for a valid category', () => {
      const materials = segmentationService.getSuggestedMaterials('wall');
      expect(materials.length).toBeGreaterThan(0);
      materials.forEach((m) => {
        expect(m).toHaveProperty('id');
        expect(m).toHaveProperty('name');
        expect(m).toHaveProperty('description');
        expect(m.category).toBe('wall');
      });
    });

    it('should return empty array for unknown category', () => {
      const materials = segmentationService.getSuggestedMaterials('nonexistent');
      expect(materials).toEqual([]);
    });
  });
});
