import { describe, it, expect } from 'vitest';
import { isValidDecorStyle, isValidUUID, isValidEmail } from './validators';
import { formatBRL, formatDate, formatDateTime } from './formatters';

describe('isValidDecorStyle', () => {
  it('should return true for valid styles', () => {
    expect(isValidDecorStyle('moderno')).toBe(true);
    expect(isValidDecorStyle('industrial')).toBe(true);
    expect(isValidDecorStyle('luxo')).toBe(true);
    expect(isValidDecorStyle('boho')).toBe(true);
  });

  it('should return false for invalid styles', () => {
    expect(isValidDecorStyle('invalid')).toBe(false);
    expect(isValidDecorStyle('')).toBe(false);
    expect(isValidDecorStyle('MODERNO')).toBe(false);
  });
});

describe('isValidUUID', () => {
  it('should return true for valid UUIDs', () => {
    expect(isValidUUID('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
    expect(isValidUUID('6ba7b810-9dad-11d1-80b4-00c04fd430c8')).toBe(true);
  });

  it('should return false for invalid UUIDs', () => {
    expect(isValidUUID('not-a-uuid')).toBe(false);
    expect(isValidUUID('')).toBe(false);
    expect(isValidUUID('550e8400-e29b-41d4-a716')).toBe(false);
    expect(isValidUUID('550e8400e29b41d4a716446655440000')).toBe(false);
  });
});

describe('isValidEmail', () => {
  it('should return true for valid emails', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
    expect(isValidEmail('test.user@domain.co.br')).toBe(true);
  });

  it('should return false for invalid emails', () => {
    expect(isValidEmail('not-an-email')).toBe(false);
    expect(isValidEmail('')).toBe(false);
    expect(isValidEmail('@domain.com')).toBe(false);
    expect(isValidEmail('user@')).toBe(false);
  });
});

describe('formatBRL', () => {
  it('should format cents to BRL currency', () => {
    const result = formatBRL(1990);
    expect(result).toContain('19,90');
    expect(result).toContain('R$');
  });

  it('should handle zero', () => {
    const result = formatBRL(0);
    expect(result).toContain('0,00');
    expect(result).toContain('R$');
  });

  it('should handle large amounts', () => {
    const result = formatBRL(999900);
    expect(result).toContain('9.999,00');
  });
});

describe('formatDate', () => {
  it('should format ISO date to pt-BR format', () => {
    const result = formatDate('2024-03-15T10:30:00Z');
    expect(result).toBe('15/03/2024');
  });
});

describe('formatDateTime', () => {
  it('should format ISO date to pt-BR date and time', () => {
    const result = formatDateTime('2024-03-15T10:30:00Z');
    expect(result).toContain('15/03/2024');
    expect(result).toMatch(/\d{2}:\d{2}/);
  });
});
