import { describe, it, expect } from 'vitest';
import {
  type UserProfile,
  type Project,
  type ProjectVersion,
  type SpatialInput,
  type ReferenceItem,
  type ChatMessage,
  type Subscription,
  type Diagnostic,
  type RenderJob,
} from './index';

describe('Type exports', () => {
  it('should allow creating a valid UserProfile', () => {
    const user: UserProfile = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      display_name: 'Test User',
      avatar_url: null,
      preferred_style: 'moderno',
      lgpd_consent_at: null,
      training_opt_in: false,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    };
    expect(user.id).toBeDefined();
    expect(user.display_name).toBe('Test User');
  });

  it('should allow creating a valid Project', () => {
    const project: Project = {
      id: '550e8400-e29b-41d4-a716-446655440001',
      user_id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Sala de Estar',
      input_type: 'photo',
      style: 'industrial',
      status: 'draft',
      is_favorite: false,
      original_image_url: null,
      room_type: 'sala',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    };
    expect(project.name).toBe('Sala de Estar');
    expect(project.status).toBe('draft');
  });

  it('should allow creating a valid ProjectVersion', () => {
    const version: ProjectVersion = {
      id: '550e8400-e29b-41d4-a716-446655440002',
      project_id: '550e8400-e29b-41d4-a716-446655440001',
      version_number: 1,
      image_url: 'https://example.com/image.jpg',
      thumbnail_url: 'https://example.com/thumb.jpg',
      prompt: 'sala moderna com tons neutros',
      refinement_command: null,
      quality_scores: null,
      metadata: {
        depth_map_url: null,
        conditioning_params: {},
        gpu_provider: 'fal',
        generation_time_ms: 15000,
        cost_cents: 5,
        resolution: { width: 1024, height: 1024 },
      },
      created_at: '2024-01-01T00:00:00Z',
    };
    expect(version.version_number).toBe(1);
  });

  it('should allow creating a valid SpatialInput', () => {
    const spatial: SpatialInput = {
      id: '550e8400-e29b-41d4-a716-446655440003',
      project_id: '550e8400-e29b-41d4-a716-446655440001',
      dimensions: { width_m: 5, length_m: 4, height_m: 2.8 },
      openings: [
        { type: 'door', wall: 'north', width_m: 0.9, height_m: 2.1, offset_m: 1.5 },
      ],
      items: [],
      croqui_ascii: null,
      croqui_approved: false,
      photo_interpretation: null,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    };
    expect(spatial.dimensions?.width_m).toBe(5);
  });

  it('should allow creating a valid ReferenceItem', () => {
    const ref: ReferenceItem = {
      id: '550e8400-e29b-41d4-a716-446655440004',
      project_id: '550e8400-e29b-41d4-a716-446655440001',
      name: 'sofa',
      image_url: 'https://example.com/sofa.jpg',
      dimensions: { width_m: 2.0, depth_m: 0.9, height_m: 0.8 },
      material: 'couro',
      color: 'marrom',
      position_description: 'centro da sala',
      created_at: '2024-01-01T00:00:00Z',
    };
    expect(ref.name).toBe('sofa');
  });

  it('should allow creating a valid ChatMessage', () => {
    const msg: ChatMessage = {
      id: '550e8400-e29b-41d4-a716-446655440005',
      project_id: '550e8400-e29b-41d4-a716-446655440001',
      role: 'user',
      content: 'Troque o piso para madeira',
      operations: [
        { type: 'change', target: 'piso', params: { material: 'madeira' } },
      ],
      version_id: null,
      created_at: '2024-01-01T00:00:00Z',
    };
    expect(msg.role).toBe('user');
    expect(msg.operations).toHaveLength(1);
  });

  it('should allow creating a valid Subscription', () => {
    const sub: Subscription = {
      id: '550e8400-e29b-41d4-a716-446655440006',
      user_id: '550e8400-e29b-41d4-a716-446655440000',
      tier: 'pro',
      status: 'active',
      payment_gateway: 'stripe',
      gateway_customer_id: 'cus_123',
      gateway_subscription_id: 'sub_123',
      renders_used: 10,
      renders_limit: 100,
      current_period_start: '2024-01-01T00:00:00Z',
      current_period_end: '2024-02-01T00:00:00Z',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    };
    expect(sub.tier).toBe('pro');
    expect(sub.renders_limit).toBe(100);
  });

  it('should allow creating a valid Diagnostic', () => {
    const diag: Diagnostic = {
      id: '550e8400-e29b-41d4-a716-446655440007',
      user_id: null,
      original_image_url: 'https://example.com/original.jpg',
      staged_preview_url: null,
      analysis: {
        issues: [
          { category: 'lighting', severity: 'high', description: 'Iluminacao insuficiente' },
        ],
        estimated_loss_percent: 15,
        estimated_loss_brl: null,
        overall_score: 65,
        recommendations: ['Melhorar iluminacao'],
      },
      session_token: null,
      created_at: '2024-01-01T00:00:00Z',
    };
    expect(diag.analysis.overall_score).toBe(65);
  });

  it('should allow creating a valid RenderJob', () => {
    const job: RenderJob = {
      id: '550e8400-e29b-41d4-a716-446655440008',
      project_id: '550e8400-e29b-41d4-a716-446655440001',
      version_id: null,
      type: 'initial',
      status: 'queued',
      priority: 1,
      input_params: { style: 'moderno' },
      output_params: null,
      gpu_provider: null,
      cost_cents: null,
      duration_ms: null,
      error_message: null,
      attempts: 0,
      started_at: null,
      completed_at: null,
      created_at: '2024-01-01T00:00:00Z',
    };
    expect(job.status).toBe('queued');
    expect(job.attempts).toBe(0);
  });
});
