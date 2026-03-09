/**
 * LaMa Inpainting client service (Story 3.3, Task 1).
 * Wraps fal.ai LaMa endpoint for large-mask inpainting with Fourier convolutions.
 * Used for object removal — fills masked regions with contextual background.
 */

import { logger } from '../lib/logger';

const FAL_API_URL = process.env.FAL_API_URL || 'https://fal.run';
const FAL_API_KEY = process.env.FAL_API_KEY || '';

interface LamaInput {
  image_url: string;
  mask_url: string;
}

interface LamaResult {
  result_image_url: string;
  metadata: {
    model: string;
    inference_time_ms: number;
    provider: string;
  };
}

const fetchWithTimeout = async (
  url: string,
  options: RequestInit & { timeoutMs?: number } = {},
): Promise<Response> => {
  const { timeoutMs = 60000, ...fetchOptions } = options;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timer);
  }
};

export const lamaClient = {
  _apiUrl: FAL_API_URL,
  _apiKey: FAL_API_KEY,
  _timeoutMs: 90000,

  /**
   * Inpaint masked region using LaMa (Large Mask Inpainting).
   * LaMa excels at filling large areas (furniture-sized objects) with
   * contextually appropriate content using Fourier convolutions.
   */
  async inpaint(input: LamaInput): Promise<LamaResult> {
    const url = `${this._apiUrl}/fal-ai/lama`;

    logger.info({ url }, 'LaMa: inpainting masked region');

    const startTime = Date.now();

    const response = await fetchWithTimeout(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Key ${this._apiKey}`,
      },
      body: JSON.stringify({
        image_url: input.image_url,
        mask_url: input.mask_url,
      }),
      timeoutMs: this._timeoutMs,
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`LaMa inpainting failed (${response.status}): ${errorBody}`);
    }

    const data = await response.json() as { image?: { url: string }; images?: Array<{ url: string }> };
    const inferenceTimeMs = Date.now() - startTime;

    const resultUrl = data.image?.url || data.images?.[0]?.url;
    if (!resultUrl) {
      throw new Error('LaMa returned no image result');
    }

    return {
      result_image_url: resultUrl,
      metadata: {
        model: 'lama',
        inference_time_ms: inferenceTimeMs,
        provider: 'fal.ai',
      },
    };
  },
};
