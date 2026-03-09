import { z } from 'zod';
import { DECOR_STYLES } from '@decorai/shared';

const ROOM_TYPES = [
  'sala',
  'quarto',
  'cozinha',
  'banheiro',
  'escritorio',
  'varanda',
  'area_gourmet',
  'closet',
  'lavabo',
  'area_servico',
] as const;

const INPUT_TYPES = ['photo', 'text', 'combined'] as const;

const PROJECT_STATUSES = ['draft', 'analyzing', 'croqui_review', 'generating', 'ready', 'error'] as const;

export const createProjectSchema = z.object({
  name: z.string().min(1, 'Nome e obrigatorio').max(100, 'Nome deve ter no maximo 100 caracteres'),
  input_type: z.enum(INPUT_TYPES, { message: 'input_type deve ser photo, text ou combined' }),
  style: z.enum(DECOR_STYLES, { message: 'Estilo invalido' }),
  room_type: z.enum(ROOM_TYPES, { message: 'Tipo de comodo invalido' }).optional(),
});

export const updateProjectSchema = z.object({
  name: z.string().min(1, 'Nome e obrigatorio').max(100, 'Nome deve ter no maximo 100 caracteres').optional(),
  style: z.enum(DECOR_STYLES, { message: 'Estilo invalido' }).optional(),
  room_type: z.enum(ROOM_TYPES, { message: 'Tipo de comodo invalido' }).optional(),
  is_favorite: z.boolean().optional(),
});

export const listProjectsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(20),
  cursor: z.string().uuid('cursor deve ser um UUID valido').optional(),
  status: z.enum(PROJECT_STATUSES, { message: 'Status invalido' }).optional(),
});

export const projectIdParamsSchema = z.object({
  id: z.string().uuid('ID deve ser um UUID valido'),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type ListProjectsQuery = z.infer<typeof listProjectsQuerySchema>;
export type ProjectIdParams = z.infer<typeof projectIdParamsSchema>;
