import { describe, it, expect } from 'vitest';
import { isValidDecorStyle, isValidUUID, isValidEmail, formatBRL, formatDate, formatDateTime } from '../utils';

describe('Validators', () => {
  describe('isValidDecorStyle', () => {
    it('returns true for valid styles', () => {
      expect(isValidDecorStyle('moderno')).toBe(true);
      expect(isValidDecorStyle('industrial')).toBe(true);
      expect(isValidDecorStyle('luxo')).toBe(true);
    });

    it('returns false for invalid styles', () => {
      expect(isValidDecorStyle('gothic')).toBe(false);
      expect(isValidDecorStyle('')).toBe(false);
      expect(isValidDecorStyle('MODERNO')).toBe(false);
    });
  });

  describe('isValidUUID', () => {
    it('returns true for valid UUIDs', () => {
      expect(isValidUUID('123e4567-e89b-12d3-a456-426614174000')).toBe(true);
      expect(isValidUUID('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
    });

    it('returns false for invalid UUIDs', () => {
      expect(isValidUUID('not-a-uuid')).toBe(false);
      expect(isValidUUID('')).toBe(false);
      expect(isValidUUID('123e4567-e89b-12d3-a456')).toBe(false);
    });
  });

  describe('isValidEmail', () => {
    it('returns true for valid emails', () => {
      expect(isValidEmail('user@example.com')).toBe(true);
      expect(isValidEmail('test@domain.co.br')).toBe(true);
    });

    it('returns false for invalid emails', () => {
      expect(isValidEmail('not-email')).toBe(false);
      expect(isValidEmail('')).toBe(false);
      expect(isValidEmail('@domain.com')).toBe(false);
    });
  });
});

describe('Formatters', () => {
  describe('formatBRL', () => {
    it('formats cents to BRL currency', () => {
      const result = formatBRL(1500);
      expect(result).toContain('15');
    });

    it('formats zero cents', () => {
      const result = formatBRL(0);
      expect(result).toContain('0');
    });
  });

  describe('formatDate', () => {
    it('formats ISO date to pt-BR format', () => {
      const result = formatDate('2026-03-09T12:00:00Z');
      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });
  });

  describe('formatDateTime', () => {
    it('formats ISO date to pt-BR datetime format', () => {
      const result = formatDateTime('2026-03-09T14:30:00Z');
      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });
  });
});
