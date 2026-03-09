import { z } from 'zod';
import { DECOR_STYLES } from '@decorai/shared';

export const stagingProjectIdParamsSchema = z.object({
  projectId: z.string().uuid('projectId deve ser um UUID valido'),
});

export const generateStagingSchema = z.object({
  style_id: z.enum(DECOR_STYLES, { message: 'Estilo de decoracao invalido' }),
});

export const variationStagingSchema = z.object({
  style_id: z.enum(DECOR_STYLES, { message: 'Estilo de decoracao invalido' }),
});

export type StagingProjectIdParams = z.infer<typeof stagingProjectIdParamsSchema>;
export type GenerateStagingInput = z.infer<typeof generateStagingSchema>;
export type VariationStagingInput = z.infer<typeof variationStagingSchema>;
