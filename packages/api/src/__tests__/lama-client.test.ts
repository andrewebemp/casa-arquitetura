import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('../lib/logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
  },
}));

import { lamaClient } from '../services/lama-client';

describe('lama-client', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
    lamaClient._apiUrl = 'https://fal.run';
    lamaClient._apiKey = 'test-key';
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe('inpaint', () => {
    it('should call fal.ai LaMa and return result on success', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          image: { url: 'https://fal.ai/lama-result.jpg' },
        }),
      }) as unknown as typeof fetch;

      const result = await lamaClient.inpaint({
        image_url: 'https://storage.com/photo.jpg',
        mask_url: 'https://storage.com/mask.png',
      });

      expect(result.result_image_url).toBe('https://fal.ai/lama-result.jpg');
      expect(result.metadata.model).toBe('lama');
      expect(result.metadata.provider).toBe('fal.ai');
      expect(result.metadata.inference_time_ms).toBeGreaterThanOrEqual(0);
    });

    it('should handle images array response format', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          images: [{ url: 'https://fal.ai/lama-result2.jpg' }],
        }),
      }) as unknown as typeof fetch;

      const result = await lamaClient.inpaint({
        image_url: 'https://storage.com/photo.jpg',
        mask_url: 'https://storage.com/mask.png',
      });

      expect(result.result_image_url).toBe('https://fal.ai/lama-result2.jpg');
    });

    it('should throw error on non-ok response', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        text: () => Promise.resolve('Internal Server Error'),
      }) as unknown as typeof fetch;

      await expect(
        lamaClient.inpaint({
          image_url: 'https://storage.com/photo.jpg',
          mask_url: 'https://storage.com/mask.png',
        }),
      ).rejects.toThrow('LaMa inpainting failed (500)');
    });

    it('should throw error when no image returned', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      }) as unknown as typeof fetch;

      await expect(
        lamaClient.inpaint({
          image_url: 'https://storage.com/photo.jpg',
          mask_url: 'https://storage.com/mask.png',
        }),
      ).rejects.toThrow('LaMa returned no image result');
    });

    it('should send correct request body', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          image: { url: 'https://fal.ai/result.jpg' },
        }),
      });
      global.fetch = mockFetch as unknown as typeof fetch;

      await lamaClient.inpaint({
        image_url: 'https://storage.com/photo.jpg',
        mask_url: 'https://storage.com/mask.png',
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://fal.run/fal-ai/lama',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            image_url: 'https://storage.com/photo.jpg',
            mask_url: 'https://storage.com/mask.png',
          }),
        }),
      );
    });
  });
});
