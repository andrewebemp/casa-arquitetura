import { describe, it, expect, vi } from 'vitest';

vi.mock('../lib/logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
  },
}));

import { maskUtils } from '../services/mask-utils';

describe('mask-utils', () => {
  describe('dilateMask', () => {
    it('should accept a buffer and return a buffer', () => {
      const input = Buffer.from('test-mask-data');
      const result = maskUtils.dilateMask(input, 7);
      expect(Buffer.isBuffer(result)).toBe(true);
    });

    it('should use default dilation when no px specified', () => {
      const input = Buffer.from('test-mask-data');
      const result = maskUtils.dilateMask(input);
      expect(Buffer.isBuffer(result)).toBe(true);
    });
  });

  describe('combineMasks', () => {
    it('should throw error when no mask URLs provided', async () => {
      await expect(maskUtils.combineMasks([])).rejects.toThrow('No mask URLs provided');
    });

    it('should return single mask URL directly', async () => {
      const result = await maskUtils.combineMasks(['https://storage.com/mask1.png']);
      expect(result).toBe('https://storage.com/mask1.png');
    });

    it('should combine multiple masks into composite URL', async () => {
      const result = await maskUtils.combineMasks([
        'https://storage.com/mask1.png',
        'https://storage.com/mask2.png',
        'https://storage.com/mask3.png',
      ]);
      expect(result).toContain('composite:');
      expect(result).toContain('mask1.png');
      expect(result).toContain('mask2.png');
      expect(result).toContain('mask3.png');
    });
  });

  describe('parseCompositeMask', () => {
    it('should parse composite mask URL back into individual URLs', () => {
      const composite = 'composite:https://a.com/m1.png,https://a.com/m2.png';
      const result = maskUtils.parseCompositeMask(composite);
      expect(result).toEqual(['https://a.com/m1.png', 'https://a.com/m2.png']);
    });

    it('should return single URL in array for non-composite', () => {
      const result = maskUtils.parseCompositeMask('https://a.com/mask.png');
      expect(result).toEqual(['https://a.com/mask.png']);
    });
  });

  describe('combineBounds', () => {
    it('should return zero bounds for empty array', () => {
      const result = maskUtils.combineBounds([]);
      expect(result).toEqual({ x: 0, y: 0, width: 0, height: 0 });
    });

    it('should return same bounds for single item', () => {
      const result = maskUtils.combineBounds([{ x: 10, y: 20, width: 100, height: 50 }]);
      expect(result).toEqual({ x: 10, y: 20, width: 100, height: 50 });
    });

    it('should compute encompassing bounds for multiple items', () => {
      const result = maskUtils.combineBounds([
        { x: 10, y: 20, width: 100, height: 50 },
        { x: 200, y: 10, width: 80, height: 60 },
      ]);
      expect(result).toEqual({ x: 10, y: 10, width: 270, height: 60 });
    });

    it('should handle overlapping bounds', () => {
      const result = maskUtils.combineBounds([
        { x: 0, y: 0, width: 100, height: 100 },
        { x: 50, y: 50, width: 100, height: 100 },
      ]);
      expect(result).toEqual({ x: 0, y: 0, width: 150, height: 150 });
    });
  });
});
