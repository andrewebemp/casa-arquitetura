import { describe, it, expect } from 'vitest';
import { stylesRegistry, STAGING_STYLES } from '../services/staging-styles.registry';

describe('staging styles registry', () => {
  describe('STAGING_STYLES', () => {
    it('should have exactly 10 predefined styles', () => {
      expect(STAGING_STYLES).toHaveLength(10);
    });

    it('should include all required style IDs', () => {
      const ids = STAGING_STYLES.map((s) => s.id);
      expect(ids).toContain('moderno');
      expect(ids).toContain('industrial');
      expect(ids).toContain('minimalista');
      expect(ids).toContain('classico');
      expect(ids).toContain('escandinavo');
      expect(ids).toContain('rustico');
      expect(ids).toContain('tropical');
      expect(ids).toContain('contemporaneo');
      expect(ids).toContain('boho');
      expect(ids).toContain('luxo');
    });

    it('should have required fields for every style', () => {
      for (const style of STAGING_STYLES) {
        expect(style.id).toBeTruthy();
        expect(style.name).toBeTruthy();
        expect(style.description).toBeTruthy();
        expect(style.preview_url).toBeTruthy();
        expect(style.prompt_modifier).toBeTruthy();
        expect(style.negative_prompt).toBeTruthy();
      }
    });

    it('should have unique IDs', () => {
      const ids = STAGING_STYLES.map((s) => s.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have pt-BR names', () => {
      const names = STAGING_STYLES.map((s) => s.name);
      expect(names).toContain('Moderno');
      expect(names).toContain('Industrial');
      expect(names).toContain('Minimalista');
      expect(names).toContain('Classico');
      expect(names).toContain('Escandinavo');
      expect(names).toContain('Rustico');
      expect(names).toContain('Tropical');
      expect(names).toContain('Contemporaneo');
      expect(names).toContain('Boho');
      expect(names).toContain('Luxo');
    });
  });

  describe('getAll', () => {
    it('should return all 10 styles', () => {
      const styles = stylesRegistry.getAll();
      expect(styles).toHaveLength(10);
    });
  });

  describe('getById', () => {
    it('should return the correct style for a valid ID', () => {
      const style = stylesRegistry.getById('moderno');
      expect(style).toBeDefined();
      expect(style!.id).toBe('moderno');
      expect(style!.name).toBe('Moderno');
    });

    it('should return undefined for an invalid ID', () => {
      const style = stylesRegistry.getById('invalid' as never);
      expect(style).toBeUndefined();
    });
  });
});
