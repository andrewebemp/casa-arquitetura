import { describe, it, expect } from 'vitest';
import { fillModePrompts } from '../services/fill-mode.prompts';

describe('fill-mode-prompts', () => {
  describe('getPrompt', () => {
    it('should return prompt and negativePrompt for auto mode', () => {
      const result = fillModePrompts.getPrompt('auto');
      expect(result.prompt).toContain('surrounding environment');
      expect(result.negativePrompt).toContain('objects');
    });

    it('should return floor-specific prompt for floor mode', () => {
      const result = fillModePrompts.getPrompt('floor');
      expect(result.prompt).toContain('floor pattern');
    });

    it('should return wall-specific prompt for wall mode', () => {
      const result = fillModePrompts.getPrompt('wall');
      expect(result.prompt).toContain('wall color');
    });

    it('should return background-specific prompt for background mode', () => {
      const result = fillModePrompts.getPrompt('background');
      expect(result.prompt).toContain('background continuation');
    });

    it('should include quality keywords in all modes', () => {
      const modes = ['auto', 'floor', 'wall', 'background'] as const;
      for (const mode of modes) {
        const result = fillModePrompts.getPrompt(mode);
        expect(result.prompt).toContain('photorealistic');
        expect(result.negativePrompt).toContain('artifacts');
      }
    });
  });

  describe('isValidFillMode', () => {
    it('should return true for valid modes', () => {
      expect(fillModePrompts.isValidFillMode('auto')).toBe(true);
      expect(fillModePrompts.isValidFillMode('floor')).toBe(true);
      expect(fillModePrompts.isValidFillMode('wall')).toBe(true);
      expect(fillModePrompts.isValidFillMode('background')).toBe(true);
    });

    it('should return false for invalid modes', () => {
      expect(fillModePrompts.isValidFillMode('invalid')).toBe(false);
      expect(fillModePrompts.isValidFillMode('')).toBe(false);
    });
  });

  describe('getAllModes', () => {
    it('should return all four fill modes', () => {
      const modes = fillModePrompts.getAllModes();
      expect(modes).toEqual(['auto', 'floor', 'wall', 'background']);
    });
  });
});
