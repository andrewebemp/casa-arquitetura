import { describe, it, expect, vi } from 'vitest';

vi.mock('../lib/logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
  },
}));

import { lightingAnalysis } from '../services/lighting-analysis';

describe('lighting-analysis', () => {
  describe('analyzeFromBuffer', () => {
    it('should detect dark image as underexposed', () => {
      // Create a buffer with low byte values (dark image)
      const darkBuffer = Buffer.alloc(10000, 20);
      const result = lightingAnalysis.analyzeFromBuffer(darkBuffer);

      expect(result.brightness_score).toBeLessThan(35);
      expect(result.exposure_level).toBe('underexposed');
      expect(result.needs_enhancement).toBe(true);
      expect(result.lighting_issues.length).toBeGreaterThan(0);
    });

    it('should detect bright image as normal or overexposed', () => {
      // Create a buffer with high byte values (bright image)
      const brightBuffer = Buffer.alloc(10000, 200);
      const result = lightingAnalysis.analyzeFromBuffer(brightBuffer);

      expect(result.brightness_score).toBeGreaterThan(70);
    });

    it('should detect mid-range image as normal', () => {
      // Create a buffer with middle byte values
      const normalBuffer = Buffer.alloc(10000, 128);
      const result = lightingAnalysis.analyzeFromBuffer(normalBuffer);

      expect(result.brightness_score).toBeGreaterThan(35);
      expect(result.brightness_score).toBeLessThanOrEqual(75);
      expect(result.exposure_level).toBe('normal');
      expect(result.lighting_issues).toEqual([]);
    });

    it('should handle empty buffer gracefully', () => {
      const emptyBuffer = Buffer.alloc(0);
      const result = lightingAnalysis.analyzeFromBuffer(emptyBuffer);

      expect(result.brightness_score).toBe(50);
      expect(result.exposure_level).toBe('normal');
    });
  });

  describe('analyzeFromScore', () => {
    it('should classify score < 35 as underexposed', () => {
      const result = lightingAnalysis.analyzeFromScore(20);
      expect(result.exposure_level).toBe('underexposed');
      expect(result.needs_enhancement).toBe(true);
    });

    it('should classify score 35-75 as normal', () => {
      const result = lightingAnalysis.analyzeFromScore(50);
      expect(result.exposure_level).toBe('normal');
      expect(result.needs_enhancement).toBe(true); // <= 70 still needs enhancement
    });

    it('should classify score > 70 with needs_enhancement false', () => {
      const result = lightingAnalysis.analyzeFromScore(75);
      expect(result.needs_enhancement).toBe(false);
    });

    it('should classify score > 75 as overexposed', () => {
      const result = lightingAnalysis.analyzeFromScore(85);
      expect(result.exposure_level).toBe('overexposed');
    });

    it('should clamp score to 0-100 range', () => {
      const resultLow = lightingAnalysis.analyzeFromScore(-10);
      expect(resultLow.brightness_score).toBe(0);

      const resultHigh = lightingAnalysis.analyzeFromScore(150);
      expect(resultHigh.brightness_score).toBe(100);
    });

    it('should detect severely dark lighting issues', () => {
      const result = lightingAnalysis.analyzeFromScore(15);
      expect(result.lighting_issues).toContain('severely_dark');
      expect(result.lighting_issues).toContain('low_detail_visibility');
    });
  });

  describe('validateEnhancementQuality', () => {
    it('should pass when brightness improved by >= 10', () => {
      const result = lightingAnalysis.validateEnhancementQuality(
        30, 45, 1024, 768, 1024, 768,
      );
      expect(result.valid).toBe(true);
      expect(result.issues).toEqual([]);
    });

    it('should fail when brightness improvement < 10', () => {
      const result = lightingAnalysis.validateEnhancementQuality(
        30, 35, 1024, 768, 1024, 768,
      );
      expect(result.valid).toBe(false);
      expect(result.issues[0]).toContain('brightness_improvement_insufficient');
    });

    it('should fail when dimensions mismatch', () => {
      const result = lightingAnalysis.validateEnhancementQuality(
        30, 50, 1024, 768, 512, 384,
      );
      expect(result.valid).toBe(false);
      expect(result.issues[0]).toContain('dimension_mismatch');
    });
  });
});
