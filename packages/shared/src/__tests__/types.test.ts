import { describe, it, expect } from 'vitest';
import * as types from '../types';

describe('Type exports', () => {
  it('exports all type modules', () => {
    expect(types).toBeDefined();
  });

  it('can create a UserProfile-shaped object', () => {
    const user: types.UserProfile = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      display_name: 'Test User',
      avatar_url: null,
      preferred_style: 'moderno',
      lgpd_consent_at: null,
      training_opt_in: false,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    };
    expect(user.id).toBe('123e4567-e89b-12d3-a456-426614174000');
    expect(user.training_opt_in).toBe(false);
  });

  it('can create a Project-shaped object', () => {
    const project: types.Project = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      user_id: '123e4567-e89b-12d3-a456-426614174001',
      name: 'Sala de Estar',
      input_type: 'photo',
      style: 'industrial',
      status: 'draft',
      is_favorite: false,
      original_image_url: null,
      room_type: 'sala',
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    };
    expect(project.name).toBe('Sala de Estar');
    expect(project.status).toBe('draft');
  });

  it('can create a RenderJob-shaped object', () => {
    const job: types.RenderJob = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      project_id: '123e4567-e89b-12d3-a456-426614174001',
      version_id: null,
      type: 'initial',
      status: 'queued',
      priority: 0,
      input_params: {},
      output_params: null,
      gpu_provider: null,
      cost_cents: null,
      duration_ms: null,
      error_message: null,
      attempts: 0,
      started_at: null,
      completed_at: null,
      created_at: '2026-01-01T00:00:00Z',
    };
    expect(job.status).toBe('queued');
    expect(job.attempts).toBe(0);
  });

  it('can create a Subscription-shaped object', () => {
    const sub: types.Subscription = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      user_id: '123e4567-e89b-12d3-a456-426614174001',
      tier: 'free',
      status: 'active',
      payment_gateway: 'stripe',
      gateway_customer_id: 'cus_test',
      gateway_subscription_id: null,
      renders_used: 0,
      renders_limit: 3,
      current_period_start: '2026-01-01T00:00:00Z',
      current_period_end: '2026-02-01T00:00:00Z',
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    };
    expect(sub.tier).toBe('free');
    expect(sub.renders_limit).toBe(3);
  });
});
