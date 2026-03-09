import { z } from 'zod';

export const projectIdParamsSchema = z.object({
  id: z.string().uuid('ID deve ser um UUID valido'),
});

export const adjustCroquiSchema = z.object({
  instructions: z.string()
    .min(3, 'instructions deve ter pelo menos 3 caracteres')
    .max(1000, 'instructions deve ter no maximo 1000 caracteres'),
});

export type ProjectIdParams = z.infer<typeof projectIdParamsSchema>;
export type AdjustCroquiInput = z.infer<typeof adjustCroquiSchema>;
