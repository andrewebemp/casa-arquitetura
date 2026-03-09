import { z } from 'zod';

export const shareProjectIdParamsSchema = z.object({
  projectId: z.string().uuid('projectId deve ser um UUID valido'),
});

export const shareIdParamsSchema = z.object({
  projectId: z.string().uuid('projectId deve ser um UUID valido'),
  shareId: z.string().uuid('shareId deve ser um UUID valido'),
});

export const shareTokenParamsSchema = z.object({
  shareToken: z.string().min(1, 'shareToken e obrigatorio'),
});

export const sliderDataQuerySchema = z.object({
  version_id: z.string().uuid('version_id deve ser um UUID valido').optional(),
});

export const createShareSchema = z.object({
  version_id: z.string().uuid('version_id deve ser um UUID valido').optional(),
  expires_in_days: z.number().int().min(1).max(365).optional(),
});

export type ShareProjectIdParams = z.infer<typeof shareProjectIdParamsSchema>;
export type ShareIdParams = z.infer<typeof shareIdParamsSchema>;
export type ShareTokenParams = z.infer<typeof shareTokenParamsSchema>;
export type SliderDataQuery = z.infer<typeof sliderDataQuerySchema>;
export type CreateShareInput = z.infer<typeof createShareSchema>;
