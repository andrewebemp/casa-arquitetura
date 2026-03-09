/**
 * Lighting Enhancement API Schemas (Story 3.2, Task 4)
 */

import { z } from 'zod';

export const enhanceLightingParamsSchema = z.object({
  projectId: z.string().uuid('projectId deve ser um UUID valido'),
});

export const enhanceLightingBodySchema = z.object({
  image_version_id: z.string().uuid('image_version_id deve ser um UUID valido'),
  mode: z.enum(['auto', 'natural', 'warm']).default('auto'),
  auto_enhance: z.boolean().optional(),
});

export type EnhanceLightingParams = z.infer<typeof enhanceLightingParamsSchema>;
export type EnhanceLightingBody = z.infer<typeof enhanceLightingBodySchema>;
