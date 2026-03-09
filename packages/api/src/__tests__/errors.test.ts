import { describe, it, expect } from 'vitest';
import { AppError } from '../lib/errors';

describe('AppError', () => {
  it('should create an error with required properties', () => {
    const error = new AppError({
      code: 'NOT_FOUND',
      message: 'Resource not found',
    });

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AppError);
    expect(error.name).toBe('AppError');
    expect(error.code).toBe('NOT_FOUND');
    expect(error.message).toBe('Resource not found');
    expect(error.statusCode).toBe(500);
    expect(error.details).toBeUndefined();
  });

  it('should create an error with custom statusCode and details', () => {
    const details = { field: 'email', reason: 'invalid format' };
    const error = new AppError({
      code: 'VALIDATION_ERROR',
      message: 'Invalid input',
      statusCode: 400,
      details,
    });

    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.statusCode).toBe(400);
    expect(error.details).toEqual(details);
  });

  it('should inherit from Error and have a stack trace', () => {
    const error = new AppError({ code: 'TEST', message: 'test error' });

    expect(error.stack).toBeDefined();
    expect(error.stack).toContain('test error');
  });

  it('should default statusCode to 500', () => {
    const error = new AppError({ code: 'INTERNAL', message: 'oops' });
    expect(error.statusCode).toBe(500);
  });
});
