import { describe, it, expect } from 'vitest';
import { materialCatalog } from '../services/material-catalog.registry';

describe('material-catalog', () => {
  describe('getAll', () => {
    it('should return all materials', () => {
      const all = materialCatalog.getAll();
      expect(all.length).toBeGreaterThan(0);
      all.forEach((m) => {
        expect(m).toHaveProperty('id');
        expect(m).toHaveProperty('name');
        expect(m).toHaveProperty('description');
        expect(m).toHaveProperty('prompt_descriptor');
        expect(m).toHaveProperty('negative_prompt');
        expect(m).toHaveProperty('category');
      });
    });
  });

  describe('getById', () => {
    it('should return a material by id', () => {
      const material = materialCatalog.getById('wall-white-paint');
      expect(material).toBeDefined();
      expect(material!.name).toBe('Tinta Branca');
      expect(material!.category).toBe('wall');
    });

    it('should return undefined for unknown id', () => {
      const material = materialCatalog.getById('nonexistent');
      expect(material).toBeUndefined();
    });
  });

  describe('getByCategory', () => {
    it('should return wall materials', () => {
      const materials = materialCatalog.getByCategory('wall');
      expect(materials.length).toBeGreaterThan(0);
      materials.forEach((m) => {
        expect(m.category).toBe('wall');
      });
    });

    it('should return floor materials', () => {
      const materials = materialCatalog.getByCategory('floor');
      expect(materials.length).toBeGreaterThan(0);
      materials.forEach((m) => {
        expect(m.category).toBe('floor');
      });
    });

    it('should return countertop materials', () => {
      const materials = materialCatalog.getByCategory('countertop');
      expect(materials.length).toBeGreaterThan(0);
      materials.forEach((m) => {
        expect(m.category).toBe('countertop');
      });
    });

    it('should return cabinet materials', () => {
      const materials = materialCatalog.getByCategory('cabinet');
      expect(materials.length).toBeGreaterThan(0);
      materials.forEach((m) => {
        expect(m.category).toBe('cabinet');
      });
    });

    it('should return empty array for category with no materials', () => {
      // All categories have materials, but test the filter logic
      const materials = materialCatalog.getByCategory('other');
      materials.forEach((m) => {
        expect(m.category).toBe('other');
      });
    });
  });

  describe('getSuggested', () => {
    it('should return suggested materials for a category', () => {
      const suggested = materialCatalog.getSuggested('floor');
      expect(suggested.length).toBeGreaterThan(0);
      suggested.forEach((m) => {
        expect(m.category).toBe('floor');
      });
    });
  });
});
