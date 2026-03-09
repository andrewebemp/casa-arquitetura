import { describe, it, expect } from 'vitest';
import { DECOR_STYLES, TIER_LIMITS } from './index';
import type { DecorStyle, TierLimits } from './index';

describe('DECOR_STYLES', () => {
  it('should have exactly 10 styles', () => {
    expect(DECOR_STYLES).toHaveLength(10);
  });

  it('should contain all expected styles', () => {
    const expected: DecorStyle[] = [
      'moderno',
      'industrial',
      'minimalista',
      'classico',
      'escandinavo',
      'rustico',
      'tropical',
      'contemporaneo',
      'boho',
      'luxo',
    ];
    expect([...DECOR_STYLES]).toEqual(expected);
  });

  it('should be a readonly tuple (as const)', () => {
    // `as const` creates a readonly tuple at compile time
    // Runtime check: verify it is an array and has expected length
    expect(Array.isArray(DECOR_STYLES)).toBe(true);
    expect(DECOR_STYLES.length).toBe(10);
  });
});

describe('TIER_LIMITS', () => {
  it('should define limits for free tier', () => {
    const free: TierLimits = TIER_LIMITS.free;
    expect(free.renders_limit).toBe(3);
    expect(free.priority).toBe(0);
  });

  it('should define limits for pro tier', () => {
    const pro: TierLimits = TIER_LIMITS.pro;
    expect(pro.renders_limit).toBe(100);
    expect(pro.priority).toBe(1);
  });

  it('should define limits for business tier', () => {
    const business: TierLimits = TIER_LIMITS.business;
    expect(business.renders_limit).toBe(500);
    expect(business.priority).toBe(2);
  });

  it('should have exactly 3 tiers', () => {
    expect(Object.keys(TIER_LIMITS)).toHaveLength(3);
    expect(Object.keys(TIER_LIMITS)).toEqual(['free', 'pro', 'business']);
  });
});
