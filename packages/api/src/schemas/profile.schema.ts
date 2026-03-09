import { z } from 'zod';
import { DECOR_STYLES } from '@decorai/shared';

export const updateProfileSchema = z.object({
  display_name: z.string().min(1, 'Nome e obrigatorio').max(100, 'Nome deve ter no maximo 100 caracteres').optional(),
  avatar_url: z.string().url('URL do avatar invalida').nullable().optional(),
  preferred_style: z.enum(DECOR_STYLES, { message: 'Estilo invalido' }).nullable().optional(),
  lgpd_consent_at: z.string().datetime({ message: 'Data de consentimento LGPD invalida' }).nullable().optional(),
  training_opt_in: z.boolean().optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
