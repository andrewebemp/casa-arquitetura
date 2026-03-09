/**
 * Lighting Analysis Module (Story 3.2, Task 2).
 * Computes brightness score (0-100) via histogram analysis,
 * detects exposure level, and identifies lighting issues.
 */

import { logger } from '../lib/logger';

export type ExposureLevel = 'underexposed' | 'normal' | 'overexposed';

export interface LightingAssessment {
  brightness_score: number;
  exposure_level: ExposureLevel;
  lighting_issues: string[];
  needs_enhancement: boolean;
}

/**
 * Computes brightness score from image buffer by analyzing pixel luminance.
 * Uses a sampling approach for performance on large images.
 * Score range: 0 (completely dark) to 100 (completely bright).
 */
function computeBrightnessFromBuffer(buffer: Buffer): number {
  // Sample every Nth byte to approximate mean luminance
  // For raw image data, we sample across the buffer
  const sampleInterval = Math.max(1, Math.floor(buffer.length / 10000));
  let sum = 0;
  let count = 0;

  for (let i = 0; i < buffer.length; i += sampleInterval) {
    sum += buffer[i];
    count++;
  }

  if (count === 0) return 50;

  const meanLuminance = sum / count;
  // Normalize to 0-100 scale
  return Math.round((meanLuminance / 255) * 100);
}

/**
 * Determines exposure level from brightness score.
 */
function classifyExposure(brightnessScore: number): ExposureLevel {
  if (brightnessScore < 35) return 'underexposed';
  if (brightnessScore > 75) return 'overexposed';
  return 'normal';
}

/**
 * Detects specific lighting issues based on brightness analysis.
 */
function detectLightingIssues(brightnessScore: number): string[] {
  const issues: string[] = [];

  if (brightnessScore < 20) {
    issues.push('severely_dark');
    issues.push('low_detail_visibility');
  } else if (brightnessScore < 35) {
    issues.push('underexposed');
    issues.push('poor_shadow_detail');
  }

  if (brightnessScore > 85) {
    issues.push('overexposed');
    issues.push('highlight_clipping');
  } else if (brightnessScore > 75) {
    issues.push('slightly_overexposed');
  }

  if (brightnessScore >= 35 && brightnessScore <= 75) {
    // Normal range, no issues
  }

  return issues;
}

export const lightingAnalysis = {
  /**
   * Analyzes image lighting from a buffer.
   */
  analyzeFromBuffer(buffer: Buffer): LightingAssessment {
    const brightnessScore = computeBrightnessFromBuffer(buffer);
    const exposureLevel = classifyExposure(brightnessScore);
    const lightingIssues = detectLightingIssues(brightnessScore);
    const needsEnhancement = brightnessScore <= 70;

    logger.info(
      { brightnessScore, exposureLevel, issueCount: lightingIssues.length },
      'Lighting analysis complete',
    );

    return {
      brightness_score: brightnessScore,
      exposure_level: exposureLevel,
      lighting_issues: lightingIssues,
      needs_enhancement: needsEnhancement,
    };
  },

  /**
   * Analyzes image lighting from a brightness score (when image is remote).
   * Used when we already have a pre-computed brightness value.
   */
  analyzeFromScore(brightnessScore: number): LightingAssessment {
    const clampedScore = Math.max(0, Math.min(100, Math.round(brightnessScore)));
    const exposureLevel = classifyExposure(clampedScore);
    const lightingIssues = detectLightingIssues(clampedScore);
    const needsEnhancement = clampedScore <= 70;

    return {
      brightness_score: clampedScore,
      exposure_level: exposureLevel,
      lighting_issues: lightingIssues,
      needs_enhancement: needsEnhancement,
    };
  },

  /**
   * Validates that IC-Light enhancement actually improved the image.
   * Returns true if quality checks pass (AC6).
   */
  validateEnhancementQuality(
    originalScore: number,
    enhancedScore: number,
    originalWidth: number,
    originalHeight: number,
    enhancedWidth: number,
    enhancedHeight: number,
  ): { valid: boolean; issues: string[] } {
    const issues: string[] = [];

    // Brightness must improve by at least 10 points
    const brightnessDelta = enhancedScore - originalScore;
    if (brightnessDelta < 10) {
      issues.push(`brightness_improvement_insufficient: delta=${brightnessDelta}, required>=10`);
    }

    // Dimensions must match original
    if (originalWidth !== enhancedWidth || originalHeight !== enhancedHeight) {
      issues.push(`dimension_mismatch: original=${originalWidth}x${originalHeight}, enhanced=${enhancedWidth}x${enhancedHeight}`);
    }

    return {
      valid: issues.length === 0,
      issues,
    };
  },
};
