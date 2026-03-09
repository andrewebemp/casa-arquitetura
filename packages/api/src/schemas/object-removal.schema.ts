/**
 * Object Removal API Schemas (Story 3.3, Task 3)
 */

import { z } from 'zod';

export const objectRemovalParamsSchema = z.object({
  projectId: z.string().uuid('projectId deve ser um UUID valido'),
});

// AC1: Point-based selection, AC2: Bounding box selection
export const removeObjectBodySchema = z
  .object({
    x: z.number().min(0, 'x deve ser >= 0').optional(),
    y: z.number().min(0, 'y deve ser >= 0').optional(),
    bounding_box: z
      .object({
        x1: z.number().min(0),
        y1: z.number().min(0),
        x2: z.number().min(0),
        y2: z.number().min(0),
      })
      .optional(),
  })
  .refine(
    (data) => (data.x !== undefined && data.y !== undefined) || data.bounding_box !== undefined,
    { message: 'Envie coordenadas (x, y) ou bounding_box (x1, y1, x2, y2)' },
  );

// AC3: Apply removal with fill_mode
export const applyRemovalBodySchema = z.object({
  mask_id: z.string().min(1, 'mask_id e obrigatorio'),
  fill_mode: z.enum(['auto', 'floor', 'wall', 'background']).default('auto'),
});

// AC4: Batch removal
export const batchRemovalBodySchema = z.object({
  removals: z
    .array(
      z.object({
        mask_id: z.string().min(1, 'mask_id e obrigatorio'),
        fill_mode: z.enum(['auto', 'floor', 'wall', 'background']).default('auto'),
      }),
    )
    .min(1, 'Pelo menos uma remocao e necessaria')
    .max(10, 'Maximo de 10 remocoes por batch'),
});

export type ObjectRemovalParams = z.infer<typeof objectRemovalParamsSchema>;
export type RemoveObjectBody = z.infer<typeof removeObjectBodySchema>;
export type ApplyRemovalBody = z.infer<typeof applyRemovalBodySchema>;
export type BatchRemovalBody = z.infer<typeof batchRemovalBodySchema>;
