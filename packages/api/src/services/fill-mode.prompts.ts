/**
 * Fill Mode Prompt Builder (Story 3.3, Task 2)
 * Maps fill_mode values to optimized SDXL inpainting prompts for object removal.
 */

export type FillMode = 'auto' | 'floor' | 'wall' | 'background';

interface FillModePrompt {
  prompt: string;
  negativePrompt: string;
}

const FILL_MODE_PROMPTS: Record<FillMode, FillModePrompt> = {
  auto: {
    prompt: 'Clean empty space matching surrounding environment, seamless continuation of floor, wall, and background, photorealistic interior, high quality, professional photography, 8k',
    negativePrompt: 'objects, furniture, clutter, artifacts, seams, visible mask edges, distorted, unrealistic, blurry, low quality',
  },
  floor: {
    prompt: 'Clean floor surface continuing the surrounding floor pattern and material, seamless texture continuation, photorealistic interior, high quality, professional photography, 8k',
    negativePrompt: 'objects, furniture, clutter, artifacts, seams, visible mask edges, distorted, unrealistic, blurry, low quality, different flooring',
  },
  wall: {
    prompt: 'Bare wall surface matching surrounding wall color and texture, seamless paint or wallpaper continuation, photorealistic interior, high quality, professional photography, 8k',
    negativePrompt: 'objects, furniture, clutter, artifacts, seams, visible mask edges, distorted, unrealistic, blurry, low quality, different wall color',
  },
  background: {
    prompt: 'Natural background continuation matching surrounding scene elements, seamless environment fill, photorealistic interior, high quality, professional photography, 8k',
    negativePrompt: 'objects, furniture, clutter, artifacts, seams, visible mask edges, distorted, unrealistic, blurry, low quality',
  },
};

export const fillModePrompts = {
  getPrompt(fillMode: FillMode): FillModePrompt {
    return FILL_MODE_PROMPTS[fillMode];
  },

  isValidFillMode(mode: string): mode is FillMode {
    return mode in FILL_MODE_PROMPTS;
  },

  getAllModes(): FillMode[] {
    return Object.keys(FILL_MODE_PROMPTS) as FillMode[];
  },
};
