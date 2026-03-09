import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../config/env', () => ({
  env: {
    SUPABASE_URL: 'https://test.supabase.co',
    SUPABASE_ANON_KEY: 'test-anon-key',
    SUPABASE_SERVICE_ROLE_KEY: 'test-service-key',
    PORT: 3001,
    NODE_ENV: 'test',
    CORS_ORIGINS: 'http://localhost:3000',
  },
}));

vi.mock('../lib/logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
  },
}));

import { diagnosticAnalyzerService } from '../services/diagnostic-analyzer.service';

describe('diagnostic analyzer service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return a valid DiagnosticAnalysis object', async () => {
    const result = await diagnosticAnalyzerService.analyze({
      imageUrl: 'https://example.com/test.jpg',
    });

    expect(result).toHaveProperty('issues');
    expect(result).toHaveProperty('estimated_loss_percent');
    expect(result).toHaveProperty('estimated_loss_brl');
    expect(result).toHaveProperty('overall_score');
    expect(result).toHaveProperty('recommendations');
  });

  it('should return issues with valid categories', async () => {
    const result = await diagnosticAnalyzerService.analyze({
      imageUrl: 'https://example.com/test.jpg',
    });

    const validCategories = ['lighting', 'staging', 'composition', 'quality', 'clutter'];
    for (const issue of result.issues) {
      expect(validCategories).toContain(issue.category);
    }
  });

  it('should return issues with valid severities', async () => {
    const result = await diagnosticAnalyzerService.analyze({
      imageUrl: 'https://example.com/test.jpg',
    });

    const validSeverities = ['low', 'medium', 'high'];
    for (const issue of result.issues) {
      expect(validSeverities).toContain(issue.severity);
    }
  });

  it('should return overall_score between 0 and 100', async () => {
    const result = await diagnosticAnalyzerService.analyze({
      imageUrl: 'https://example.com/test.jpg',
    });

    expect(result.overall_score).toBeGreaterThanOrEqual(0);
    expect(result.overall_score).toBeLessThanOrEqual(100);
  });

  it('should return estimated_loss_percent between 0 and 100', async () => {
    const result = await diagnosticAnalyzerService.analyze({
      imageUrl: 'https://example.com/test.jpg',
    });

    expect(result.estimated_loss_percent).toBeGreaterThanOrEqual(0);
    expect(result.estimated_loss_percent).toBeLessThanOrEqual(100);
  });

  it('should always return at least one issue', async () => {
    const result = await diagnosticAnalyzerService.analyze({
      imageUrl: 'https://example.com/test.jpg',
    });

    expect(result.issues.length).toBeGreaterThanOrEqual(1);
  });

  it('should always include at least one recommendation', async () => {
    const result = await diagnosticAnalyzerService.analyze({
      imageUrl: 'https://example.com/test.jpg',
    });

    expect(result.recommendations.length).toBeGreaterThanOrEqual(1);
  });

  it('should always include the staging recommendation', async () => {
    const result = await diagnosticAnalyzerService.analyze({
      imageUrl: 'https://example.com/test.jpg',
    });

    expect(
      result.recommendations.some((r) => r.includes('staging virtual')),
    ).toBe(true);
  });
});
