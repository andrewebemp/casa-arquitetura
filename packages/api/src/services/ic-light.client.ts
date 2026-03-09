/**
 * IC-Light V2 client service (Story 3.2, Task 1).
 * Wraps fal.ai IC-Light V2 endpoint for text-conditioned relighting.
 */

import { logger } from '../lib/logger';

const FAL_API_URL = process.env.FAL_API_URL || 'https://fal.run';
const FAL_API_KEY = process.env.FAL_API_KEY || '';

export type LightingMode = 'auto' | 'natural' | 'warm';

const LIGHTING_PROMPTS: Record<LightingMode, string> = {
  auto: 'Professional real estate photography lighting, well-balanced exposure',
  natural: 'Bright natural daylight from windows, soft ambient light, clean exposure',
  warm: 'Warm evening interior lighting, accent lights, cozy ambiance',
};

interface ICLightInput {
  image_url: string;
  mode: LightingMode;
  prompt?: string;
}

interface ICLightResult {
  result_image_url: string;
  metadata: {
    model: string;
    inference_time_ms: number;
    provider: string;
    lighting_mode: LightingMode;
    prompt_used: string;
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

export const icLightClient = {
  _apiUrl: FAL_API_URL,
  _apiKey: FAL_API_KEY,
  _timeoutMs: 90000,

  getPromptForMode(mode: LightingMode, customPrompt?: string): string {
    return customPrompt || LIGHTING_PROMPTS[mode];
  },

  async enhanceLighting(input: ICLightInput): Promise<ICLightResult> {
    const prompt = this.getPromptForMode(input.mode, input.prompt);
    const url = `${this._apiUrl}/fal-ai/ic-light`;

    logger.info({ url, mode: input.mode, prompt }, 'IC-Light: relighting image');

    const startTime = Date.now();

    const response = await fetchWithTimeout(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Key ${this._apiKey}`,
      },
      body: JSON.stringify({
        image_url: input.image_url,
        prompt,
      }),
      timeoutMs: this._timeoutMs,
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`IC-Light enhancement failed (${response.status}): ${errorBody}`);
    }

    const data = await response.json() as { images?: Array<{ url: string }> };
    const inferenceTimeMs = Date.now() - startTime;

    const resultUrl = data.images?.[0]?.url;
    if (!resultUrl) {
      throw new Error('IC-Light returned no image result');
    }

    return {
      result_image_url: resultUrl,
      metadata: {
        model: 'ic-light-v2',
        inference_time_ms: inferenceTimeMs,
        provider: 'fal.ai',
        lighting_mode: input.mode,
        prompt_used: prompt,
      },
    };
  },
};
