import { supabaseAdmin } from '../lib/supabase';
import { AppError } from '../lib/errors';
import { logger } from '../lib/logger';

export const consentService = {
  async getConsent(userId: string) {
    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .select('lgpd_consent_at, lgpd_consent_version, training_opt_in')
      .eq('id', userId)
      .single();

    if (error || !data) {
      logger.error({ err: error, userId }, 'Failed to get consent status');
      throw new AppError({
        code: 'PROFILE_NOT_FOUND',
        message: 'Perfil nao encontrado',
        statusCode: 404,
      });
    }

    return {
      lgpd_consent_at: data.lgpd_consent_at,
      lgpd_consent_version: data.lgpd_consent_version,
      training_opt_in: data.training_opt_in,
      has_consent: data.lgpd_consent_at !== null,
    };
  },

  async grantConsent(userId: string, consentVersion: string) {
    const now = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .update({
        lgpd_consent_at: now,
        lgpd_consent_version: consentVersion,
        updated_at: now,
      })
      .eq('id', userId)
      .select('lgpd_consent_at, lgpd_consent_version, training_opt_in')
      .single();

    if (error || !data) {
      logger.error({ err: error, userId }, 'Failed to grant consent');
      throw new AppError({
        code: 'CONSENT_UPDATE_FAILED',
        message: 'Falha ao registrar consentimento',
        statusCode: 500,
      });
    }

    return {
      lgpd_consent_at: data.lgpd_consent_at,
      lgpd_consent_version: data.lgpd_consent_version,
      training_opt_in: data.training_opt_in,
      has_consent: true,
    };
  },

  async revokeConsent(userId: string) {
    const now = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .update({
        lgpd_consent_at: null,
        lgpd_consent_version: null,
        training_opt_in: false,
        updated_at: now,
      })
      .eq('id', userId)
      .select('lgpd_consent_at, lgpd_consent_version, training_opt_in')
      .single();

    if (error || !data) {
      logger.error({ err: error, userId }, 'Failed to revoke consent');
      throw new AppError({
        code: 'CONSENT_UPDATE_FAILED',
        message: 'Falha ao revogar consentimento',
        statusCode: 500,
      });
    }

    return {
      lgpd_consent_at: null,
      lgpd_consent_version: null,
      training_opt_in: false,
      has_consent: false,
    };
  },

  async updateTrainingOptIn(userId: string, optIn: boolean) {
    const now = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .update({
        training_opt_in: optIn,
        updated_at: now,
      })
      .eq('id', userId)
      .select('lgpd_consent_at, lgpd_consent_version, training_opt_in')
      .single();

    if (error || !data) {
      logger.error({ err: error, userId }, 'Failed to update training opt-in');
      throw new AppError({
        code: 'CONSENT_UPDATE_FAILED',
        message: 'Falha ao atualizar preferencia de treinamento',
        statusCode: 500,
      });
    }

    return {
      lgpd_consent_at: data.lgpd_consent_at,
      lgpd_consent_version: data.lgpd_consent_version,
      training_opt_in: data.training_opt_in,
      has_consent: data.lgpd_consent_at !== null,
    };
  },

  async hasConsent(userId: string): Promise<boolean> {
    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .select('lgpd_consent_at')
      .eq('id', userId)
      .single();

    if (error || !data) {
      return false;
    }

    return data.lgpd_consent_at !== null;
  },
};
