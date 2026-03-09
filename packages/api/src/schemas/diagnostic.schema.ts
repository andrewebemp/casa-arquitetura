import { z } from 'zod';

export const createDiagnosticBodySchema = z.object({
  property_type: z.string().min(1, 'Tipo do imovel e obrigatorio').optional(),
  location: z.string().optional(),
});

export const diagnosticIdParamsSchema = z.object({
  id: z.string().uuid('id deve ser um UUID valido'),
});

export type CreateDiagnosticBody = z.infer<typeof createDiagnosticBodySchema>;
export type DiagnosticIdParams = z.infer<typeof diagnosticIdParamsSchema>;
