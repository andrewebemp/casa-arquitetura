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

vi.mock('../lib/ai-pipeline.client', () => ({
  aiPipelineClient: {
    segment: vi.fn(),
    inpaint: vi.fn(),
  },
}));

vi.mock('../services/lama-client', () => ({
  lamaClient: {
    inpaint: vi.fn(),
  },
}));

vi.mock('../services/mask-utils', () => ({
  maskUtils: {
    dilateMask: vi.fn((buf: Buffer) => buf),
    combineMasks: vi.fn(),
    parseCompositeMask: vi.fn(),
    combineBounds: vi.fn(),
  },
}));

import { objectRemovalService } from '../services/object-removal.service';
import { supabaseAdmin, createUserClient } from '../lib/supabase';
import { redisHealthCheck } from '../lib/redis';
import { quotaService } from '../services/quota.service';
import { enqueueRenderJob } from '../queue/render.queue';
import { renderEvents } from '../queue/render.events';
import { samClient } from '../services/sam-client';
import { aiPipelineClient } from '../lib/ai-pipeline.client';
import { lamaClient } from '../services/lama-client';
import { maskUtils } from '../services/mask-utils';

const mockSupabaseFrom = vi.mocked(supabaseAdmin.from);
const mockCreateUserClient = vi.mocked(createUserClient);
const mockRedisHealthCheck = vi.mocked(redisHealthCheck);
const mockEnforceQuota = vi.mocked(quotaService.enforceQuota);
const mockEnqueue = vi.mocked(enqueueRenderJob);
const mockBroadcast = vi.mocked(renderEvents.broadcast);
const mockSegmentByPoint = vi.mocked(samClient.segmentByPoint);
const mockSegmentByBox = vi.mocked(samClient.segmentByBox);
const mockAiSegment = vi.mocked(aiPipelineClient.segment);
const mockLamaInpaint = vi.mocked(lamaClient.inpaint);
const mockCombineMasks = vi.mocked(maskUtils.combineMasks);
const mockCombineBounds = vi.mocked(maskUtils.combineBounds);

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
  segment_id: 'mask-1',
  label: 'chair',
  mask_url: 'https://storage.com/mask.png',
  polygon: [{ x: 0, y: 0 }, { x: 100, y: 0 }],
  bounding_box: { x: 10, y: 10, width: 80, height: 80 },
  confidence: 0.92,
};

describe('object-removal-service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('selectObject', () => {
    const baseInput = {
      projectId: 'proj-1',
      userId: 'user-1',
      accessToken: 'token-123',
      x: 50,
      y: 50,
    };

    it('should throw PROJECT_NOT_FOUND when project does not exist', async () => {
      const clientChain = buildChain();
      clientChain.single.mockResolvedValue({ data: null, error: { message: 'not found' } });
      const userClient = { from: vi.fn().mockReturnValue(clientChain) };
      mockCreateUserClient.mockReturnValue(userClient as never);

      await expect(objectRemovalService.selectObject(baseInput)).rejects.toMatchObject({
        code: 'PROJECT_NOT_FOUND',
        statusCode: 404,
      });
    });

    it('should throw NO_IMAGE_AVAILABLE when no versions exist', async () => {
      const clientChain = buildChain();
      clientChain.single.mockResolvedValue({ data: { id: 'proj-1' }, error: null });
      const userClient = { from: vi.fn().mockReturnValue(clientChain) };
      mockCreateUserClient.mockReturnValue(userClient as never);

      const versionChain = buildChain();
      versionChain.limit.mockResolvedValue({ data: [], error: null });
      mockSupabaseFrom.mockReturnValue(versionChain as never);

      await expect(objectRemovalService.selectObject(baseInput)).rejects.toMatchObject({
        code: 'NO_IMAGE_AVAILABLE',
        statusCode: 404,
      });
    });

    it('should return mask preview for point-based selection (AC1)', async () => {
      const clientChain = buildChain();
      clientChain.single.mockResolvedValue({ data: { id: 'proj-1' }, error: null });
      const userClient = { from: vi.fn().mockReturnValue(clientChain) };
      mockCreateUserClient.mockReturnValue(userClient as never);

      const versionChain = buildChain();
      versionChain.limit.mockResolvedValue({
        data: [{ id: 'v-1', version_number: 1, image_url: 'https://storage.com/render.jpg' }],
        error: null,
      });
      mockSupabaseFrom.mockReturnValue(versionChain as never);

      mockSegmentByPoint.mockResolvedValue(MOCK_SEGMENT);

      const result = await objectRemovalService.selectObject(baseInput);

      expect(result.mask_id).toBe('mask-1');
      expect(result.label).toBe('chair');
      expect(result.mask_url).toBe('https://storage.com/mask.png');
      expect(result.confidence).toBe(0.92);
      expect(mockSegmentByPoint).toHaveBeenCalledWith({
        image_url: 'https://storage.com/render.jpg',
        x: 50,
        y: 50,
      });
    });

    it('should return mask preview for bounding box selection (AC2)', async () => {
      const clientChain = buildChain();
      clientChain.single.mockResolvedValue({ data: { id: 'proj-1' }, error: null });
      const userClient = { from: vi.fn().mockReturnValue(clientChain) };
      mockCreateUserClient.mockReturnValue(userClient as never);

      const versionChain = buildChain();
      versionChain.limit.mockResolvedValue({
        data: [{ id: 'v-1', version_number: 1, image_url: 'https://storage.com/render.jpg' }],
        error: null,
      });
      mockSupabaseFrom.mockReturnValue(versionChain as never);

      mockSegmentByBox.mockResolvedValue(MOCK_SEGMENT);

      const result = await objectRemovalService.selectObject({
        projectId: 'proj-1',
        userId: 'user-1',
        accessToken: 'token-123',
        boundingBox: { x1: 10, y1: 10, x2: 90, y2: 90 },
      });

      expect(result.mask_id).toBe('mask-1');
      expect(mockSegmentByBox).toHaveBeenCalledWith({
        image_url: 'https://storage.com/render.jpg',
        box: { x: 10, y: 10, width: 80, height: 80 },
      });
    });
  });

  describe('applyRemoval', () => {
    const baseInput = {
      projectId: 'proj-1',
      userId: 'user-1',
      accessToken: 'token-123',
      maskId: 'mask-1',
      fillMode: 'auto',
    };

    it('should throw QUEUE_UNAVAILABLE when Redis is down', async () => {
      mockRedisHealthCheck.mockResolvedValue(false);

      await expect(objectRemovalService.applyRemoval(baseInput)).rejects.toMatchObject({
        code: 'QUEUE_UNAVAILABLE',
        statusCode: 503,
      });
    });

    it('should create job and enqueue on success (AC3)', async () => {
      mockRedisHealthCheck.mockResolvedValue(true);

      const clientChain = buildChain();
      clientChain.single.mockResolvedValue({ data: { id: 'proj-1' }, error: null });
      const userClient = { from: vi.fn().mockReturnValue(clientChain) };
      mockCreateUserClient.mockReturnValue(userClient as never);

      let adminCallCount = 0;
      mockSupabaseFrom.mockImplementation(() => {
        adminCallCount++;
        if (adminCallCount === 1) {
          const versionChain = buildChain();
          versionChain.limit.mockResolvedValue({
            data: [{ id: 'v-1', version_number: 2, image_url: 'https://storage.com/render.jpg' }],
            error: null,
          });
          return versionChain as never;
        }
        const insertChain = buildChain();
        insertChain.single.mockResolvedValue({
          data: {
            id: 'rem-job-1',
            project_id: 'proj-1',
            type: 'object_removal',
            status: 'queued',
            input_params: {
              mask_id: 'mask-1',
              fill_mode: 'auto',
              base_image_url: 'https://storage.com/render.jpg',
              base_version_id: 'v-1',
              base_version_number: 2,
              mode: 'single',
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

      mockEnqueue.mockResolvedValue('rem-job-1');

      const result = await objectRemovalService.applyRemoval(baseInput);

      expect(result.job_id).toBe('rem-job-1');
      expect(result.status).toBe('queued');
      expect(result.mask_id).toBe('mask-1');
      expect(result.fill_mode).toBe('auto');
      expect(mockEnqueue).toHaveBeenCalled();
    });
  });

  describe('applyBatchRemoval', () => {
    const baseInput = {
      projectId: 'proj-1',
      userId: 'user-1',
      accessToken: 'token-123',
      removals: [
        { mask_id: 'mask-1', fill_mode: 'auto' },
        { mask_id: 'mask-2', fill_mode: 'floor' },
      ],
    };

    it('should create batch job and enqueue (AC4)', async () => {
      mockRedisHealthCheck.mockResolvedValue(true);

      const clientChain = buildChain();
      clientChain.single.mockResolvedValue({ data: { id: 'proj-1' }, error: null });
      const userClient = { from: vi.fn().mockReturnValue(clientChain) };
      mockCreateUserClient.mockReturnValue(userClient as never);

      let adminCallCount = 0;
      mockSupabaseFrom.mockImplementation(() => {
        adminCallCount++;
        if (adminCallCount === 1) {
          const versionChain = buildChain();
          versionChain.limit.mockResolvedValue({
            data: [{ id: 'v-1', version_number: 3, image_url: 'https://storage.com/render.jpg' }],
            error: null,
          });
          return versionChain as never;
        }
        const insertChain = buildChain();
        insertChain.single.mockResolvedValue({
          data: {
            id: 'batch-job-1',
            project_id: 'proj-1',
            type: 'object_removal',
            status: 'queued',
            input_params: {
              removals: baseInput.removals,
              base_image_url: 'https://storage.com/render.jpg',
              base_version_id: 'v-1',
              base_version_number: 3,
              mode: 'batch',
            },
          },
          error: null,
        });
        return insertChain as never;
      });

      mockEnforceQuota.mockResolvedValue({
        allowed: true,
        renders_used: 2,
        renders_limit: 10,
        remaining: 8,
        tier: 'pro',
      });

      mockEnqueue.mockResolvedValue('batch-job-1');

      const result = await objectRemovalService.applyBatchRemoval(baseInput);

      expect(result.job_id).toBe('batch-job-1');
      expect(result.status).toBe('queued');
      expect(result.removals_count).toBe(2);
      expect(mockEnqueue).toHaveBeenCalled();
    });
  });

  describe('processObjectRemovalJob - single', () => {
    it('should process single removal via LaMa and create version', async () => {
      const inputParams = {
        mask_id: 'mask-1',
        fill_mode: 'auto',
        base_image_url: 'https://storage.com/render.jpg',
        base_version_number: 2,
        mode: 'single',
      };

      let adminCallCount = 0;
      mockSupabaseFrom.mockImplementation(() => {
        adminCallCount++;
        if (adminCallCount === 1) {
          const jobChain = buildChain();
          jobChain.single.mockResolvedValue({ data: { project_id: 'proj-1' }, error: null });
          return jobChain as never;
        }
        if (adminCallCount === 2) {
          const insertChain = buildChain();
          insertChain.single.mockResolvedValue({
            data: { id: 'v-3', version_number: 3 },
            error: null,
          });
          return insertChain as never;
        }
        const updateChain = buildChain();
        updateChain.eq.mockResolvedValue({ error: null });
        return updateChain as never;
      });

      mockAiSegment.mockResolvedValue({
        segments: [{
          segment_id: 'mask-1',
          label: 'chair',
          mask_url: 'https://storage.com/mask.png',
          polygon: [],
          bounding_box: { x: 0, y: 0, width: 100, height: 100 },
          confidence: 0.9,
        }],
        provider: 'fal',
        inference_time_ms: 2000,
      });

      mockLamaInpaint.mockResolvedValue({
        result_image_url: 'https://storage.com/result.jpg',
        metadata: {
          model: 'lama',
          inference_time_ms: 5000,
          provider: 'fal.ai',
        },
      });

      mockBroadcast.mockResolvedValue(undefined);

      const result = await objectRemovalService.processObjectRemovalJob('rem-job-1', inputParams);

      expect(result.result_url).toBe('https://storage.com/result.jpg');
      expect(result.version_id).toBe('v-3');
      expect(result.generation_time_ms).toBeGreaterThanOrEqual(0);

      // Verify LaMa was called (not SDXL inpaint)
      expect(mockLamaInpaint).toHaveBeenCalledWith({
        image_url: 'https://storage.com/render.jpg',
        mask_url: 'https://storage.com/mask.png',
      });

      // Verify progress broadcasts at correct stages
      expect(mockBroadcast).toHaveBeenCalledWith(
        expect.objectContaining({ jobId: 'rem-job-1', progress: 20 }),
      );
      expect(mockBroadcast).toHaveBeenCalledWith(
        expect.objectContaining({ jobId: 'rem-job-1', progress: 40 }),
      );
      expect(mockBroadcast).toHaveBeenCalledWith(
        expect.objectContaining({ jobId: 'rem-job-1', progress: 60 }),
      );
      expect(mockBroadcast).toHaveBeenCalledWith(
        expect.objectContaining({ jobId: 'rem-job-1', progress: 80 }),
      );
      expect(mockBroadcast).toHaveBeenCalledWith(
        expect.objectContaining({ jobId: 'rem-job-1', progress: 100, status: 'completed' }),
      );
    });

    it('should throw MASK_NOT_FOUND when segment is not found', async () => {
      const inputParams = {
        mask_id: 'nonexistent',
        fill_mode: 'auto',
        base_image_url: 'https://storage.com/render.jpg',
        base_version_number: 2,
        mode: 'single',
      };

      const jobChain = buildChain();
      jobChain.single.mockResolvedValue({ data: { project_id: 'proj-1' }, error: null });
      mockSupabaseFrom.mockReturnValue(jobChain as never);

      mockAiSegment.mockResolvedValue({
        segments: [{
          segment_id: 'other-mask',
          label: 'wall',
          mask_url: 'https://storage.com/mask.png',
          polygon: [],
          bounding_box: { x: 0, y: 0, width: 100, height: 100 },
          confidence: 0.9,
        }],
        provider: 'fal',
        inference_time_ms: 2000,
      });

      mockBroadcast.mockResolvedValue(undefined);

      await expect(
        objectRemovalService.processObjectRemovalJob('rem-job-1', inputParams),
      ).rejects.toMatchObject({
        code: 'MASK_NOT_FOUND',
        statusCode: 404,
      });
    });
  });

  describe('processObjectRemovalJob - batch', () => {
    it('should process batch removal with composite mask via LaMa (AC4)', async () => {
      const inputParams = {
        removals: [
          { mask_id: 'mask-1', fill_mode: 'auto' },
          { mask_id: 'mask-2', fill_mode: 'floor' },
        ],
        base_image_url: 'https://storage.com/render.jpg',
        base_version_number: 3,
        mode: 'batch',
      };

      let adminCallCount = 0;
      mockSupabaseFrom.mockImplementation(() => {
        adminCallCount++;
        if (adminCallCount === 1) {
          const jobChain = buildChain();
          jobChain.single.mockResolvedValue({ data: { project_id: 'proj-1' }, error: null });
          return jobChain as never;
        }
        if (adminCallCount === 2) {
          const insertChain = buildChain();
          insertChain.single.mockResolvedValue({
            data: { id: 'v-4', version_number: 4 },
            error: null,
          });
          return insertChain as never;
        }
        const updateChain = buildChain();
        updateChain.eq.mockResolvedValue({ error: null });
        return updateChain as never;
      });

      // Single segment call returns both masks
      mockAiSegment.mockResolvedValue({
        segments: [
          {
            segment_id: 'mask-1',
            label: 'chair',
            mask_url: 'https://storage.com/mask1.png',
            polygon: [],
            bounding_box: { x: 0, y: 0, width: 50, height: 50 },
            confidence: 0.9,
          },
          {
            segment_id: 'mask-2',
            label: 'lamp',
            mask_url: 'https://storage.com/mask2.png',
            polygon: [],
            bounding_box: { x: 50, y: 50, width: 30, height: 60 },
            confidence: 0.85,
          },
        ],
        provider: 'fal',
        inference_time_ms: 2000,
      });

      mockCombineMasks.mockResolvedValue('composite:https://storage.com/mask1.png,https://storage.com/mask2.png');
      mockCombineBounds.mockReturnValue({ x: 0, y: 0, width: 80, height: 110 });

      mockLamaInpaint.mockResolvedValue({
        result_image_url: 'https://storage.com/batch-result.jpg',
        metadata: { model: 'lama', inference_time_ms: 8000, provider: 'fal.ai' },
      });

      mockBroadcast.mockResolvedValue(undefined);

      const result = await objectRemovalService.processObjectRemovalJob('batch-job-1', inputParams);

      expect(result.result_url).toBe('https://storage.com/batch-result.jpg');
      expect(result.version_id).toBe('v-4');

      // Verify single LaMa pass with composite mask
      expect(mockLamaInpaint).toHaveBeenCalledTimes(1);
      expect(mockCombineMasks).toHaveBeenCalledWith([
        'https://storage.com/mask1.png',
        'https://storage.com/mask2.png',
      ]);

      // Verify completion broadcast
      expect(mockBroadcast).toHaveBeenCalledWith(
        expect.objectContaining({ jobId: 'batch-job-1', progress: 100, status: 'completed' }),
      );
    });

    it('should throw NO_MASKS_FOUND when no masks match in batch', async () => {
      const inputParams = {
        removals: [
          { mask_id: 'nonexistent-1', fill_mode: 'auto' },
          { mask_id: 'nonexistent-2', fill_mode: 'wall' },
        ],
        base_image_url: 'https://storage.com/render.jpg',
        base_version_number: 3,
        mode: 'batch',
      };

      const jobChain = buildChain();
      jobChain.single.mockResolvedValue({ data: { project_id: 'proj-1' }, error: null });
      mockSupabaseFrom.mockReturnValue(jobChain as never);

      mockAiSegment.mockResolvedValue({
        segments: [{
          segment_id: 'other-mask',
          label: 'wall',
          mask_url: 'https://storage.com/mask-other.png',
          polygon: [],
          bounding_box: { x: 0, y: 0, width: 100, height: 100 },
          confidence: 0.9,
        }],
        provider: 'fal',
        inference_time_ms: 2000,
      });

      mockBroadcast.mockResolvedValue(undefined);

      await expect(
        objectRemovalService.processObjectRemovalJob('batch-job-1', inputParams),
      ).rejects.toMatchObject({
        code: 'NO_MASKS_FOUND',
        statusCode: 404,
      });
    });
  });
});
