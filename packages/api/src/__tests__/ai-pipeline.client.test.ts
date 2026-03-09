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

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

import { aiPipelineClient } from '../lib/ai-pipeline.client';

describe('aiPipelineClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    aiPipelineClient.configure({
      baseUrl: 'http://localhost:8000',
      apiKey: 'test-key',
    });
  });

  describe('analyzeDepth', () => {
    it('should call POST /analyze/depth and return result', async () => {
      const mockResult = {
        depth_map_url: 'https://example.com/depth.png',
        estimated_dimensions: { width_m: 4.0, length_m: 5.0, height_m: 2.8 },
        detected_features: [],
        provider: 'fal',
        inference_time_ms: 500,
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResult),
      });

      const result = await aiPipelineClient.analyzeDepth('https://example.com/room.jpg');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/analyze/depth',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ image_url: 'https://example.com/room.jpg' }),
        }),
      );
      expect(result.depth_map_url).toBe('https://example.com/depth.png');
    });

    it('should throw on non-ok response', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 502,
        text: () => Promise.resolve('Provider error'),
      });

      await expect(
        aiPipelineClient.analyzeDepth('https://example.com/room.jpg'),
      ).rejects.toThrow('AI Pipeline depth analysis failed (502)');
    });
  });

  describe('analyzeStyle', () => {
    it('should call POST /analyze/style with style name', async () => {
      const mockResult = {
        style_prompt: 'modern interior',
        negative_prompt: 'bad quality',
        clip_embeddings: [0.1, 0.2],
        controlnet_params: {
          depth_strength: 0.7,
          edge_strength: 0.4,
          guidance_scale: 7.5,
          num_inference_steps: 30,
        },
        provider: 'fal',
        inference_time_ms: 200,
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResult),
      });

      const result = await aiPipelineClient.analyzeStyle('moderno');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/analyze/style',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ style: 'moderno' }),
        }),
      );
      expect(result.style_prompt).toBe('modern interior');
    });

    it('should include reference image URL when provided', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          style_prompt: 'test',
          negative_prompt: 'bad',
          clip_embeddings: [],
          controlnet_params: {},
          provider: 'fal',
          inference_time_ms: 100,
        }),
      });

      await aiPipelineClient.analyzeStyle('luxo', 'https://example.com/ref.jpg');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/analyze/style',
        expect.objectContaining({
          body: JSON.stringify({
            style: 'luxo',
            reference_image_url: 'https://example.com/ref.jpg',
          }),
        }),
      );
    });
  });

  describe('generate', () => {
    it('should call POST /generate with all params', async () => {
      const mockResult = {
        result_image_url: 'https://example.com/gen.png',
        metadata: {
          model: 'fast-sdxl',
          inference_time_ms: 1500,
          provider: 'fal',
          upscaled: false,
        },
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResult),
      });

      const result = await aiPipelineClient.generate({
        sourceImageUrl: 'https://example.com/room.jpg',
        depthMapUrl: 'https://example.com/depth.png',
        styleParams: { style_prompt: 'modern' },
        outputResolution: '1024x1024',
      });

      expect(result.result_image_url).toBe('https://example.com/gen.png');
      expect(result.metadata.provider).toBe('fal');
    });
  });

  describe('health', () => {
    it('should call GET /health', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          status: 'ok',
          providers: [{ name: 'fal', available: true, models: ['fast-sdxl'] }],
        }),
      });

      const result = await aiPipelineClient.health();
      expect(result.status).toBe('ok');
      expect(result.providers).toHaveLength(1);
    });
  });
});
