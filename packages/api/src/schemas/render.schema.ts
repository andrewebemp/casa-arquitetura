import { z } from 'zod';

const RENDER_JOB_TYPES = ['initial', 'refinement', 'style_change', 'segmentation', 'diagnostic', 'upscale', 'lighting_enhancement'] as const;

export const generateRenderSchema = z.object({
  type: z.enum(RENDER_JOB_TYPES, { message: 'Tipo de render invalido' }).default('initial'),
  input_params: z.record(z.string(), z.unknown()).default({}),
});

export const projectIdParamsSchema = z.object({
  id: z.string().uuid('ID deve ser um UUID valido'),
});

export const renderJobIdParamsSchema = z.object({
  id: z.string().uuid('ID deve ser um UUID valido'),
});

export type GenerateRenderInput = z.infer<typeof generateRenderSchema>;
export type ProjectIdParams = z.infer<typeof projectIdParamsSchema>;
export type RenderJobIdParams = z.infer<typeof renderJobIdParamsSchema>;
