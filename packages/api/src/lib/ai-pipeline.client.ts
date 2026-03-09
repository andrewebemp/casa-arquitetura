/**
 * AI Pipeline HTTP client for render worker integration (AC5).
 * Typed client for communicating with the FastAPI ai-pipeline service.
 */

import { logger } from './logger';

const AI_PIPELINE_URL = process.env.AI_PIPELINE_URL || 'http://localhost:8000';
const PIPELINE_API_KEY = process.env.PIPELINE_API_KEY || '';

interface DepthEstimationResult {
  depth_map_url: string;
  estimated_dimensions: {
    width_m: number;
    length_m: number;
    height_m: number;
  };
  detected_features: Array<{
    type: string;
    confidence: number;
    position: Record<string, number>;
  }>;
  provider: string;
  inference_time_ms: number;
}

interface StyleExtractionResult {
  style_prompt: string;
  negative_prompt: string;
  clip_embeddings: number[];
  controlnet_params: {
    depth_strength: number;
    edge_strength: number;
    guidance_scale: number;
    num_inference_steps: number;
  };
  provider: string;
  inference_time_ms: number;
}

interface GenerationResult {
  result_image_url: string;
  metadata: {
    model: string;
    inference_time_ms: number;
    provider: string;
    upscaled: boolean;
  };
}

interface HealthResult {
  status: string;
  providers: Array<{
    name: string;
    available: boolean;
    models: string[];
  }>;
}

interface SegmentInput {
  image_url: string;
  mode: 'point' | 'box' | 'auto';
  point?: { x: number; y: number };
  box?: { x: number; y: number; width: number; height: number };
}

interface SegmentResultItem {
  segment_id: string;
  label: string;
  mask_url: string;
  polygon: Array<{ x: number; y: number }>;
  bounding_box: { x: number; y: number; width: number; height: number };
  confidence: number;
}

interface SegmentResponse {
  segments: SegmentResultItem[];
  provider: string;
  inference_time_ms: number;
}

interface InpaintInput {
  image_url: string;
  mask_url: string;
  prompt: string;
  negative_prompt: string;
  depth_map_url?: string;
}

interface InpaintResult {
  result_image_url: string;
  metadata: {
    model: string;
    inference_time_ms: number;
    provider: string;
  };
}

interface PipelineClientOptions {
  baseUrl?: string;
  apiKey?: string;
  timeoutMs?: number;
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

export const aiPipelineClient = {
  _baseUrl: AI_PIPELINE_URL,
  _apiKey: PIPELINE_API_KEY,
  _timeoutMs: 60000,

  configure(options: PipelineClientOptions): void {
    if (options.baseUrl) this._baseUrl = options.baseUrl;
    if (options.apiKey) this._apiKey = options.apiKey;
    if (options.timeoutMs) this._timeoutMs = options.timeoutMs;
  },

  _headers(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'X-Pipeline-Key': this._apiKey,
    };
  },

  /**
   * AC2: Depth estimation via ZoeDepth.
   */
  async analyzeDepth(imageUrl: string): Promise<DepthEstimationResult> {
    const url = `${this._baseUrl}/analyze/depth`;
    logger.info({ url, imageUrl }, 'AI Pipeline: analyzing depth');

    const response = await fetchWithTimeout(url, {
      method: 'POST',
      headers: this._headers(),
      body: JSON.stringify({ image_url: imageUrl }),
      timeoutMs: this._timeoutMs,
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`AI Pipeline depth analysis failed (${response.status}): ${errorBody}`);
    }

    return response.json() as Promise<DepthEstimationResult>;
  },

  /**
   * AC3: Style extraction via CLIP.
   */
  async analyzeStyle(
    style: string,
    referenceImageUrl?: string,
  ): Promise<StyleExtractionResult> {
    const url = `${this._baseUrl}/analyze/style`;
    logger.info({ url, style }, 'AI Pipeline: extracting style');

    const body: Record<string, unknown> = { style };
    if (referenceImageUrl) {
      body.reference_image_url = referenceImageUrl;
    }

    const response = await fetchWithTimeout(url, {
      method: 'POST',
      headers: this._headers(),
      body: JSON.stringify(body),
      timeoutMs: this._timeoutMs,
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`AI Pipeline style extraction failed (${response.status}): ${errorBody}`);
    }

    return response.json() as Promise<StyleExtractionResult>;
  },

  /**
   * AC4: Image generation via SDXL + ControlNet.
   */
  async generate(params: {
    sourceImageUrl: string;
    depthMapUrl: string;
    styleParams: Record<string, unknown>;
    outputResolution: '1024x1024' | '2048x2048';
    callbackUrl?: string;
  }): Promise<GenerationResult> {
    const url = `${this._baseUrl}/generate`;
    logger.info({ url, resolution: params.outputResolution }, 'AI Pipeline: generating image');

    const response = await fetchWithTimeout(url, {
      method: 'POST',
      headers: this._headers(),
      body: JSON.stringify({
        source_image_url: params.sourceImageUrl,
        depth_map_url: params.depthMapUrl,
        style_params: params.styleParams,
        output_resolution: params.outputResolution,
        callback_url: params.callbackUrl,
      }),
      timeoutMs: this._timeoutMs,
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`AI Pipeline generation failed (${response.status}): ${errorBody}`);
    }

    return response.json() as Promise<GenerationResult>;
  },

  /**
   * Story 3.1: SAM 2 segmentation via fal.ai/Replicate.
   */
  async segment(input: SegmentInput): Promise<SegmentResponse> {
    const url = `${this._baseUrl}/segment`;
    logger.info({ url, mode: input.mode }, 'AI Pipeline: SAM segmentation');

    const response = await fetchWithTimeout(url, {
      method: 'POST',
      headers: this._headers(),
      body: JSON.stringify(input),
      timeoutMs: this._timeoutMs,
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`AI Pipeline segmentation failed (${response.status}): ${errorBody}`);
    }

    return response.json() as Promise<SegmentResponse>;
  },

  /**
   * Story 3.1: SDXL inpainting with mask for material swap.
   */
  async inpaint(input: InpaintInput): Promise<InpaintResult> {
    const url = `${this._baseUrl}/inpaint`;
    logger.info({ url }, 'AI Pipeline: inpainting with mask');

    const response = await fetchWithTimeout(url, {
      method: 'POST',
      headers: this._headers(),
      body: JSON.stringify({
        image_url: input.image_url,
        mask_url: input.mask_url,
        prompt: input.prompt,
        negative_prompt: input.negative_prompt,
        depth_map_url: input.depth_map_url,
      }),
      timeoutMs: this._timeoutMs,
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`AI Pipeline inpainting failed (${response.status}): ${errorBody}`);
    }

    return response.json() as Promise<InpaintResult>;
  },

  /**
   * AC6: Health check.
   */
  async health(): Promise<HealthResult> {
    const url = `${this._baseUrl}/health`;
    const response = await fetchWithTimeout(url, {
      method: 'GET',
      headers: this._headers(),
      timeoutMs: 5000,
    });

    if (!response.ok) {
      throw new Error(`AI Pipeline health check failed (${response.status})`);
    }

    return response.json() as Promise<HealthResult>;
  },
};
