import { describe, it, expect } from 'vitest';
import { elementClassifier, ELEMENT_CATEGORIES } from '../services/element-classifier';

describe('element-classifier', () => {
  describe('classify', () => {
    it('should classify wall labels correctly', () => {
      expect(elementClassifier.classify('wall', 0.9)).toBe('wall');
      expect(elementClassifier.classify('walls', 0.8)).toBe('wall');
      expect(elementClassifier.classify('drywall', 0.7)).toBe('wall');
      expect(elementClassifier.classify('accent_wall', 0.85)).toBe('wall');
    });

    it('should classify floor labels correctly', () => {
      expect(elementClassifier.classify('floor', 0.9)).toBe('floor');
      expect(elementClassifier.classify('flooring', 0.85)).toBe('floor');
      expect(elementClassifier.classify('hardwood', 0.8)).toBe('floor');
      expect(elementClassifier.classify('carpet', 0.7)).toBe('floor');
    });

    it('should classify countertop labels correctly', () => {
      expect(elementClassifier.classify('countertop', 0.9)).toBe('countertop');
      expect(elementClassifier.classify('counter', 0.85)).toBe('countertop');
      expect(elementClassifier.classify('kitchen_counter', 0.8)).toBe('countertop');
    });

    it('should classify cabinet labels correctly', () => {
      expect(elementClassifier.classify('cabinet', 0.9)).toBe('cabinet');
      expect(elementClassifier.classify('wardrobe', 0.8)).toBe('cabinet');
      expect(elementClassifier.classify('closet', 0.75)).toBe('cabinet');
    });

    it('should classify furniture correctly', () => {
      expect(elementClassifier.classify('sofa', 0.9)).toBe('furniture_large');
      expect(elementClassifier.classify('bed', 0.8)).toBe('furniture_large');
      expect(elementClassifier.classify('chair', 0.85)).toBe('furniture_small');
      expect(elementClassifier.classify('stool', 0.7)).toBe('furniture_small');
    });

    it('should classify decoration correctly', () => {
      expect(elementClassifier.classify('lamp', 0.9)).toBe('decoration');
      expect(elementClassifier.classify('plant', 0.85)).toBe('decoration');
      expect(elementClassifier.classify('mirror', 0.8)).toBe('decoration');
    });

    it('should return other for unknown labels', () => {
      expect(elementClassifier.classify('unknown_thing', 0.9)).toBe('other');
      expect(elementClassifier.classify('xyz123', 0.8)).toBe('other');
    });

    it('should return other for low confidence', () => {
      expect(elementClassifier.classify('wall', 0.1)).toBe('other');
      expect(elementClassifier.classify('floor', 0.2)).toBe('other');
    });

    it('should handle case and whitespace normalization', () => {
      expect(elementClassifier.classify('Wall', 0.9)).toBe('wall');
      expect(elementClassifier.classify('FLOOR', 0.9)).toBe('floor');
      expect(elementClassifier.classify(' cabinet ', 0.9)).toBe('cabinet');
      expect(elementClassifier.classify('kitchen-counter', 0.9)).toBe('countertop');
    });

    it('should do partial matching', () => {
      expect(elementClassifier.classify('big_sofa_sectional', 0.9)).toBe('furniture_large');
    });
  });

  describe('isValidCategory', () => {
    it('should return true for valid categories', () => {
      expect(elementClassifier.isValidCategory('wall')).toBe(true);
      expect(elementClassifier.isValidCategory('floor')).toBe(true);
      expect(elementClassifier.isValidCategory('countertop')).toBe(true);
    });

    it('should return false for invalid categories', () => {
      expect(elementClassifier.isValidCategory('invalid')).toBe(false);
      expect(elementClassifier.isValidCategory('')).toBe(false);
    });
  });

  describe('getAllCategories', () => {
    it('should return all 11 categories', () => {
      const categories = elementClassifier.getAllCategories();
      expect(categories).toHaveLength(11);
      expect(categories).toEqual(ELEMENT_CATEGORIES);
    });
  });
});
