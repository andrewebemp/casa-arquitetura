import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('../lib/logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
  },
}));

import { icLightClient } from '../services/ic-light.client';

describe('ic-light-client', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
    icLightClient._apiUrl = 'https://fal.run';
    icLightClient._apiKey = 'test-key';
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe('getPromptForMode', () => {
    it('should return auto prompt for auto mode', () => {
      const prompt = icLightClient.getPromptForMode('auto');
      expect(prompt).toContain('Professional real estate');
    });

    it('should return natural prompt for natural mode', () => {
      const prompt = icLightClient.getPromptForMode('natural');
      expect(prompt).toContain('natural daylight');
    });

    it('should return warm prompt for warm mode', () => {
      const prompt = icLightClient.getPromptForMode('warm');
      expect(prompt).toContain('Warm evening');
    });

    it('should use custom prompt when provided', () => {
      const prompt = icLightClient.getPromptForMode('auto', 'My custom prompt');
      expect(prompt).toBe('My custom prompt');
    });
  });

  describe('enhanceLighting', () => {
    it('should call fal.ai and return result on success', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          images: [{ url: 'https://fal.ai/result.jpg' }],
        }),
      }) as unknown as typeof fetch;

      const result = await icLightClient.enhanceLighting({
        image_url: 'https://storage.com/photo.jpg',
        mode: 'auto',
      });

      expect(result.result_image_url).toBe('https://fal.ai/result.jpg');
      expect(result.metadata.model).toBe('ic-light-v2');
      expect(result.metadata.provider).toBe('fal.ai');
      expect(result.metadata.lighting_mode).toBe('auto');
      expect(result.metadata.inference_time_ms).toBeGreaterThanOrEqual(0);
    });

    it('should throw error on non-ok response', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        text: () => Promise.resolve('Internal Server Error'),
      }) as unknown as typeof fetch;

      await expect(
        icLightClient.enhanceLighting({
          image_url: 'https://storage.com/photo.jpg',
          mode: 'natural',
        }),
      ).rejects.toThrow('IC-Light enhancement failed (500)');
    });

    it('should throw error when no image returned', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ images: [] }),
      }) as unknown as typeof fetch;

      await expect(
        icLightClient.enhanceLighting({
          image_url: 'https://storage.com/photo.jpg',
          mode: 'warm',
        }),
      ).rejects.toThrow('IC-Light returned no image result');
    });
  });
});
