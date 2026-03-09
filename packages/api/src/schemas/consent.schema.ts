import { z } from 'zod';

export const grantConsentSchema = z.object({
  consent_version: z.string().min(1, 'Versao do consentimento e obrigatoria'),
});

export type GrantConsentInput = z.infer<typeof grantConsentSchema>;

export const updateTrainingOptInSchema = z.object({
  training_opt_in: z.boolean(),
});

export type UpdateTrainingOptInInput = z.infer<typeof updateTrainingOptInSchema>;
