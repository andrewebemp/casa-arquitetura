import { describe, it, expect } from 'vitest';
import { signupSchema, loginSchema, googleAuthSchema, refreshSchema } from '../schemas/auth.schema';

describe('signupSchema', () => {
  it('should accept valid email and password', () => {
    const result = signupSchema.safeParse({ email: 'user@example.com', password: '12345678' });
    expect(result.success).toBe(true);
  });

  it('should reject invalid email', () => {
    const result = signupSchema.safeParse({ email: 'not-an-email', password: '12345678' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Email invalido');
    }
  });

  it('should reject empty email', () => {
    const result = signupSchema.safeParse({ email: '', password: '12345678' });
    expect(result.success).toBe(false);
  });

  it('should reject password shorter than 8 characters', () => {
    const result = signupSchema.safeParse({ email: 'user@example.com', password: '1234567' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Senha deve ter no minimo 8 caracteres');
    }
  });

  it('should accept password with exactly 8 characters', () => {
    const result = signupSchema.safeParse({ email: 'user@example.com', password: '12345678' });
    expect(result.success).toBe(true);
  });

  it('should reject missing fields', () => {
    const result = signupSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe('loginSchema', () => {
  it('should accept valid email and password', () => {
    const result = loginSchema.safeParse({ email: 'user@example.com', password: 'anypassword' });
    expect(result.success).toBe(true);
  });

  it('should reject invalid email', () => {
    const result = loginSchema.safeParse({ email: 'bad-email', password: 'anypassword' });
    expect(result.success).toBe(false);
  });

  it('should reject empty password', () => {
    const result = loginSchema.safeParse({ email: 'user@example.com', password: '' });
    expect(result.success).toBe(false);
  });
});

describe('googleAuthSchema', () => {
  it('should accept valid id_token', () => {
    const result = googleAuthSchema.safeParse({ id_token: 'google-token-abc123' });
    expect(result.success).toBe(true);
  });

  it('should reject empty id_token', () => {
    const result = googleAuthSchema.safeParse({ id_token: '' });
    expect(result.success).toBe(false);
  });

  it('should reject missing id_token', () => {
    const result = googleAuthSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe('refreshSchema', () => {
  it('should accept valid refresh_token', () => {
    const result = refreshSchema.safeParse({ refresh_token: 'refresh-token-xyz' });
    expect(result.success).toBe(true);
  });

  it('should reject empty refresh_token', () => {
    const result = refreshSchema.safeParse({ refresh_token: '' });
    expect(result.success).toBe(false);
  });

  it('should reject missing refresh_token', () => {
    const result = refreshSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
