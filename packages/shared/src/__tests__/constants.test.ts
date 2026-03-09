import { describe, it, expect } from 'vitest';
import { DECOR_STYLES, TIER_LIMITS } from '../constants';

describe('DECOR_STYLES', () => {
  it('has exactly 10 styles', () => {
    expect(DECOR_STYLES).toHaveLength(10);
  });

  it('contains all expected styles', () => {
    const expected = [
      'moderno', 'industrial', 'minimalista', 'classico', 'escandinavo',
      'rustico', 'tropical', 'contemporaneo', 'boho', 'luxo',
    ];
    expect([...DECOR_STYLES]).toEqual(expected);
  });
});

describe('TIER_LIMITS', () => {
  it('defines free tier with 3 renders', () => {
    expect(TIER_LIMITS.free.renders_limit).toBe(3);
    expect(TIER_LIMITS.free.priority).toBe(0);
  });

  it('defines pro tier with 100 renders', () => {
    expect(TIER_LIMITS.pro.renders_limit).toBe(100);
    expect(TIER_LIMITS.pro.priority).toBe(1);
  });

  it('defines business tier with 500 renders', () => {
    expect(TIER_LIMITS.business.renders_limit).toBe(500);
    expect(TIER_LIMITS.business.priority).toBe(2);
  });

  it('has exactly 3 tiers', () => {
    expect(Object.keys(TIER_LIMITS)).toHaveLength(3);
  });
});
