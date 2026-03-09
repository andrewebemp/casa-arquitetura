import { createUserClient } from '../lib/supabase';
import { AppError } from '../lib/errors';
import { logger } from '../lib/logger';
import type { UpdateProfileInput } from '../schemas/profile.schema';

export const profileService = {
  async getProfile(userId: string, accessToken: string) {
    const client = createUserClient(accessToken);

    const { data, error } = await client
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) {
      logger.error({ err: error, userId }, 'Failed to get profile');
      throw new AppError({
        code: 'PROFILE_NOT_FOUND',
        message: 'Perfil nao encontrado',
        statusCode: 404,
      });
    }

    return data;
  },

  async updateProfile(userId: string, input: UpdateProfileInput, accessToken: string) {
    const client = createUserClient(accessToken);

    const updateData: Record<string, unknown> = {};
    if (input.display_name !== undefined) updateData.display_name = input.display_name;
    if (input.avatar_url !== undefined) updateData.avatar_url = input.avatar_url;
    if (input.preferred_style !== undefined) updateData.preferred_style = input.preferred_style;
    if (input.lgpd_consent_at !== undefined) updateData.lgpd_consent_at = input.lgpd_consent_at;
    if (input.training_opt_in !== undefined) updateData.training_opt_in = input.training_opt_in;

    const { data, error } = await client
      .from('user_profiles')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (error || !data) {
      logger.error({ err: error, userId }, 'Failed to update profile');
      throw new AppError({
        code: 'PROFILE_UPDATE_FAILED',
        message: 'Falha ao atualizar perfil',
        statusCode: 500,
      });
    }

    return data;
  },
};
