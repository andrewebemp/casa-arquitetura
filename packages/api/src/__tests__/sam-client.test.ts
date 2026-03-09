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

vi.mock('../lib/ai-pipeline.client', () => ({
  aiPipelineClient: {
    segment: vi.fn(),
  },
}));

import { samClient } from '../services/sam-client';
import { aiPipelineClient } from '../lib/ai-pipeline.client';

const mockSegment = vi.mocked(aiPipelineClient.segment);

const MOCK_SEGMENT = {
  segment_id: 'seg-1',
  label: 'wall',
  mask_url: 'https://storage.com/mask.png',
  polygon: [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 100 }, { x: 0, y: 100 }],
  bounding_box: { x: 0, y: 0, width: 100, height: 100 },
  confidence: 0.95,
};

describe('sam-client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('segmentByPoint', () => {
    it('should call ai pipeline with point mode and return first segment', async () => {
      mockSegment.mockResolvedValue({
        segments: [MOCK_SEGMENT],
        provider: 'fal',
        inference_time_ms: 800,
      });

      const result = await samClient.segmentByPoint({
        image_url: 'https://example.com/image.jpg',
        x: 50,
        y: 50,
      });

      expect(mockSegment).toHaveBeenCalledWith({
        image_url: 'https://example.com/image.jpg',
        mode: 'point',
        point: { x: 50, y: 50 },
      });
      expect(result.segment_id).toBe('seg-1');
      expect(result.label).toBe('wall');
      expect(result.confidence).toBe(0.95);
    });
  });

  describe('segmentByBox', () => {
    it('should call ai pipeline with box mode and return first segment', async () => {
      mockSegment.mockResolvedValue({
        segments: [MOCK_SEGMENT],
        provider: 'fal',
        inference_time_ms: 900,
      });

      const result = await samClient.segmentByBox({
        image_url: 'https://example.com/image.jpg',
        box: { x: 10, y: 10, width: 80, height: 80 },
      });

      expect(mockSegment).toHaveBeenCalledWith({
        image_url: 'https://example.com/image.jpg',
        mode: 'box',
        box: { x: 10, y: 10, width: 80, height: 80 },
      });
      expect(result.segment_id).toBe('seg-1');
    });
  });

  describe('segmentAll', () => {
    it('should call ai pipeline with auto mode and return all segments', async () => {
      const segments = [
        MOCK_SEGMENT,
        { ...MOCK_SEGMENT, segment_id: 'seg-2', label: 'floor', confidence: 0.88 },
      ];
      mockSegment.mockResolvedValue({
        segments,
        provider: 'fal',
        inference_time_ms: 1500,
      });

      const result = await samClient.segmentAll({
        image_url: 'https://example.com/image.jpg',
      });

      expect(mockSegment).toHaveBeenCalledWith({
        image_url: 'https://example.com/image.jpg',
        mode: 'auto',
      });
      expect(result).toHaveLength(2);
      expect(result[0].segment_id).toBe('seg-1');
      expect(result[1].segment_id).toBe('seg-2');
    });
  });
});
