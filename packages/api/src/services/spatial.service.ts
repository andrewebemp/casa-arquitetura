import { createUserClient } from '../lib/supabase';
import { AppError } from '../lib/errors';
import { logger } from '../lib/logger';
import type { UpsertSpatialInput } from '../schemas/spatial.schema';

export const spatialService = {
  async upsert(projectId: string, userId: string, input: UpsertSpatialInput, accessToken: string) {
    const client = createUserClient(accessToken);

    const { data: project } = await client
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .eq('user_id', userId)
      .single();

    if (!project) {
      throw new AppError({
        code: 'PROJECT_NOT_FOUND',
        message: 'Projeto nao encontrado',
        statusCode: 404,
      });
    }

    const { data: existing } = await client
      .from('spatial_inputs')
      .select('id')
      .eq('project_id', projectId)
      .single();

    if (existing) {
      const { data, error } = await client
        .from('spatial_inputs')
        .update({
          dimensions: input.dimensions as Record<string, unknown> ?? null,
          openings: (input.openings as Record<string, unknown>[]) ?? [],
          items: (input.items as Record<string, unknown>[]) ?? [],
          updated_at: new Date().toISOString(),
        })
        .eq('project_id', projectId)
        .select()
        .single();

      if (error) {
        logger.error({ err: error }, 'Failed to update spatial input');
        throw new AppError({
          code: 'SPATIAL_INPUT_UPDATE_FAILED',
          message: 'Falha ao atualizar dados espaciais',
          statusCode: 500,
        });
      }

      return data;
    }

    const { data, error } = await client
      .from('spatial_inputs')
      .insert({
        project_id: projectId,
        dimensions: input.dimensions as Record<string, unknown> ?? null,
        openings: (input.openings as Record<string, unknown>[]) ?? [],
        items: (input.items as Record<string, unknown>[]) ?? [],
      })
      .select()
      .single();

    if (error) {
      logger.error({ err: error }, 'Failed to create spatial input');
      throw new AppError({
        code: 'SPATIAL_INPUT_CREATE_FAILED',
        message: 'Falha ao criar dados espaciais',
        statusCode: 500,
      });
    }

    return data;
  },

  async get(projectId: string, userId: string, accessToken: string) {
    const client = createUserClient(accessToken);

    const { data: project } = await client
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .eq('user_id', userId)
      .single();

    if (!project) {
      throw new AppError({
        code: 'PROJECT_NOT_FOUND',
        message: 'Projeto nao encontrado',
        statusCode: 404,
      });
    }

    const { data, error } = await client
      .from('spatial_inputs')
      .select('*')
      .eq('project_id', projectId)
      .single();

    if (error || !data) {
      throw new AppError({
        code: 'SPATIAL_INPUT_NOT_FOUND',
        message: 'Dados espaciais nao encontrados para este projeto',
        statusCode: 404,
      });
    }

    return data;
  },
};
