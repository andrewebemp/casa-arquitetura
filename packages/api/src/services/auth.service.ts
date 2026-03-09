import { supabaseAdmin } from '../lib/supabase';
import { AppError } from '../lib/errors';
import { logger } from '../lib/logger';

export const authService = {
  async signUpWithEmail(email: string, password: string) {
    const { data, error } = await supabaseAdmin.auth.signUp({ email, password });

    if (error) {
      if (error.message.includes('already registered') || error.message.includes('already been registered')) {
        throw new AppError({
          code: 'USER_ALREADY_EXISTS',
          message: 'Email ja cadastrado',
          statusCode: 409,
        });
      }
      logger.error({ err: error }, 'Signup failed');
      throw new AppError({
        code: 'AUTH_ERROR',
        message: error.message,
        statusCode: 400,
      });
    }

    return data;
  },

  async signInWithEmail(email: string, password: string) {
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({ email, password });

    if (error) {
      throw new AppError({
        code: 'INVALID_CREDENTIALS',
        message: 'Email ou senha invalidos',
        statusCode: 401,
      });
    }

    return data;
  },

  async signInWithGoogle(idToken: string) {
    const { data, error } = await supabaseAdmin.auth.signInWithIdToken({
      provider: 'google',
      token: idToken,
    });

    if (error) {
      throw new AppError({
        code: 'INVALID_TOKEN',
        message: 'Token Google invalido',
        statusCode: 401,
      });
    }

    return data;
  },

  async refreshSession(refreshToken: string) {
    const { data, error } = await supabaseAdmin.auth.refreshSession({ refresh_token: refreshToken });

    if (error) {
      throw new AppError({
        code: 'INVALID_TOKEN',
        message: 'Refresh token invalido',
        statusCode: 401,
      });
    }

    return data;
  },

  async signOut(accessToken: string) {
    const { error } = await supabaseAdmin.auth.admin.signOut(accessToken);

    if (error) {
      logger.error({ err: error }, 'Logout failed');
      throw new AppError({
        code: 'AUTH_ERROR',
        message: 'Falha ao encerrar sessao',
        statusCode: 500,
      });
    }
  },

  async getUser(accessToken: string) {
    const { data, error } = await supabaseAdmin.auth.getUser(accessToken);

    if (error || !data.user) {
      throw new AppError({
        code: 'UNAUTHORIZED',
        message: 'Token invalido',
        statusCode: 401,
      });
    }

    return {
      id: data.user.id,
      email: data.user.email,
      full_name: data.user.user_metadata?.full_name ?? null,
      avatar_url: data.user.user_metadata?.avatar_url ?? null,
      created_at: data.user.created_at,
    };
  },
};
