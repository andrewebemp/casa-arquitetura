import { z } from 'zod';

export const projectIdParamsSchema = z.object({
  id: z.string().uuid('ID deve ser um UUID valido'),
});

export const versionParamsSchema = z.object({
  id: z.string().uuid('ID do projeto deve ser um UUID valido'),
  versionId: z.string().uuid('ID da versao deve ser um UUID valido'),
});

export type ProjectIdParams = z.infer<typeof projectIdParamsSchema>;
export type VersionParams = z.infer<typeof versionParamsSchema>;
