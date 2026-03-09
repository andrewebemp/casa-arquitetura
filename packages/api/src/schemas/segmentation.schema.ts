/**
 * Segmentation API Schemas (Story 3.1)
 */

import { z } from 'zod';

export const segmentProjectParamsSchema = z.object({
  projectId: z.string().uuid('projectId deve ser um UUID valido'),
});

export const segmentPointBodySchema = z.object({
  x: z.number().min(0, 'x deve ser >= 0'),
  y: z.number().min(0, 'y deve ser >= 0'),
  box: z
    .object({
      x: z.number().min(0),
      y: z.number().min(0),
      width: z.number().min(1),
      height: z.number().min(1),
    })
    .optional(),
});

export const segmentApplyBodySchema = z.object({
  segment_id: z.string().min(1, 'segment_id e obrigatorio'),
  material_descriptor: z.string().min(1, 'material_descriptor e obrigatorio'),
});

export const segmentIdParamsSchema = z.object({
  projectId: z.string().uuid('projectId deve ser um UUID valido'),
  segmentId: z.string().min(1, 'segmentId e obrigatorio'),
});

export type SegmentProjectParams = z.infer<typeof segmentProjectParamsSchema>;
export type SegmentPointBody = z.infer<typeof segmentPointBodySchema>;
export type SegmentApplyBody = z.infer<typeof segmentApplyBodySchema>;
export type SegmentIdParams = z.infer<typeof segmentIdParamsSchema>;
