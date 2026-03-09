import { z } from 'zod';

const QUALITY_TAGS = [
  'realistic',
  'style_match',
  'lighting',
  'furniture_quality',
  'composition',
] as const;

export const renderIdParamsSchema = z.object({
  renderId: z.string().uuid('renderId deve ser um UUID valido'),
});

export const createRatingSchema = z.object({
  score: z.number().int().min(1).max(5),
  tags: z.array(z.enum(QUALITY_TAGS)).default([]),
  comment: z.string().max(1000).optional(),
});

export const npsSubmitSchema = z.object({
  score: z.number().int().min(0).max(10),
  comment: z.string().max(1000).optional(),
});

export const analyticsQuerySchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  tier: z.enum(['free', 'pro', 'business']).optional(),
  style: z.string().optional(),
});

export type RenderIdParams = z.infer<typeof renderIdParamsSchema>;
export type CreateRatingBody = z.infer<typeof createRatingSchema>;
export type NpsSubmitBody = z.infer<typeof npsSubmitSchema>;
export type AnalyticsQuery = z.infer<typeof analyticsQuerySchema>;
