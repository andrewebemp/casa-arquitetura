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

vi.mock('../lib/ai-pipeline.client', () => ({
  aiPipelineClient: {
    _baseUrl: 'http://localhost:8000',
    _apiKey: 'test-key',
    _timeoutMs: 60000,
    configure: vi.fn(),
    _headers: vi.fn().mockReturnValue({}),
    analyzeDepth: vi.fn().mockResolvedValue({
      depth_map_url: 'https://example.com/depth.png',
      estimated_dimensions: { width_m: 4, length_m: 5, height_m: 2.8 },
      detected_features: [],
      provider: 'fal',
      inference_time_ms: 500,
    }),
    analyzeStyle: vi.fn().mockResolvedValue({
      style_prompt: 'modern interior',
      negative_prompt: 'bad quality',
      clip_embeddings: [],
      controlnet_params: {
        depth_strength: 0.7,
        edge_strength: 0.4,
        guidance_scale: 7.5,
        num_inference_steps: 30,
      },
      provider: 'fal',
      inference_time_ms: 200,
    }),
    generate: vi.fn().mockResolvedValue({
      result_image_url: 'https://example.com/result.png',
      metadata: {
        model: 'fast-sdxl',
        inference_time_ms: 1500,
        provider: 'fal',
        upscaled: false,
      },
    }),
    health: vi.fn().mockResolvedValue({ status: 'ok', providers: [] }),
  },
}));

import { renderEvents } from '../queue/render.events';
import { supabaseAdmin } from '../lib/supabase';
import { aiPipelineClient } from '../lib/ai-pipeline.client';

const mockBroadcast = vi.mocked(renderEvents.broadcast);
const mockSupabaseFrom = vi.mocked(supabaseAdmin.from);
const mockAnalyzeDepth = vi.mocked(aiPipelineClient.analyzeDepth);
const mockAnalyzeStyle = vi.mocked(aiPipelineClient.analyzeStyle);
const mockGenerate = vi.mocked(aiPipelineClient.generate);

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

    it('should process job delegating to AI pipeline (AC5)', async () => {
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
          inputParams: {
            source_image_url: 'https://example.com/room.jpg',
            style: 'moderno',
            tier: 'free',
          },
        },
        updateProgress: vi.fn(),
      };

      await capturedProcessor.fn!(mockJob);

      // Verify AI pipeline was called
      expect(mockAnalyzeDepth).toHaveBeenCalledWith('https://example.com/room.jpg');
      expect(mockAnalyzeStyle).toHaveBeenCalledWith('moderno');
      expect(mockGenerate).toHaveBeenCalledWith(
        expect.objectContaining({
          sourceImageUrl: 'https://example.com/room.jpg',
          depthMapUrl: 'https://example.com/depth.png',
          outputResolution: '1024x1024',
        }),
      );

      // Verify progress broadcasts
      expect(mockBroadcast).toHaveBeenCalledWith(
        expect.objectContaining({ jobId: 'job-1', status: 'processing' }),
      );
      expect(mockBroadcast).toHaveBeenCalledWith(
        expect.objectContaining({ jobId: 'job-1', status: 'completed', progress: 100 }),
      );
    });

    it('should use 2048x2048 resolution for paid tiers', async () => {
      const { startRenderWorker: start } = await import('../queue/render.worker');
      const updateChain: Record<string, ReturnType<typeof vi.fn>> = {};
      updateChain.update = vi.fn().mockReturnValue(updateChain);
      updateChain.eq = vi.fn().mockResolvedValue({ error: null });
      mockSupabaseFrom.mockReturnValue(updateChain as never);
      mockBroadcast.mockResolvedValue(undefined);

      start();

      const mockJob = {
        data: {
          jobId: 'job-2',
          projectId: 'proj-1',
          userId: 'user-1',
          type: 'initial',
          inputParams: {
            source_image_url: 'https://example.com/room.jpg',
            style: 'luxo',
            tier: 'pro',
          },
        },
        updateProgress: vi.fn(),
      };

      await capturedProcessor.fn!(mockJob);

      expect(mockGenerate).toHaveBeenCalledWith(
        expect.objectContaining({
          outputResolution: '2048x2048',
        }),
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
