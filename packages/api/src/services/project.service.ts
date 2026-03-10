import { createUserClient, supabaseAdmin } from '../lib/supabase';
import { AppError } from '../lib/errors';
import { logger } from '../lib/logger';
import { imageCdnService } from './image-cdn.service';
import type { Database } from '@decorai/shared';
import type { CreateProjectInput, UpdateProjectInput } from '../schemas/project.schema';

type ProjectRow = Database['public']['Tables']['projects']['Row'];
type ProjectStatus = ProjectRow['status'];

export const projectService = {
  async create(userId: string, input: CreateProjectInput, accessToken: string) {
    const client = createUserClient(accessToken);

    const { data, error } = await client
      .from('projects')
      .insert({
        user_id: userId,
        name: input.name,
        input_type: input.input_type,
        style: input.style ?? null,
        room_type: input.room_type ?? null,
        status: 'draft',
        is_favorite: false,
      })
      .select()
      .single();

    if (error) {
      logger.error({ err: error }, 'Failed to create project');
      throw new AppError({
        code: 'PROJECT_CREATE_FAILED',
        message: 'Falha ao criar projeto',
        statusCode: 500,
      });
    }

    return data;
  },

  async list(
    userId: string,
    accessToken: string,
    options: { limit: number; cursor?: string; status?: string; favorite?: boolean },
  ) {
    const client = createUserClient(accessToken);

    let query = client
      .from('projects')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(options.limit + 1);

    if (options.status) {
      query = query.eq('status', options.status as ProjectStatus);
    }

    if (options.favorite !== undefined) {
      query = query.eq('is_favorite', options.favorite);
    }

    if (options.cursor) {
      const { data: cursorProject } = await client
        .from('projects')
        .select('created_at')
        .eq('id', options.cursor)
        .single();

      if (cursorProject) {
        query = query.lt('created_at', cursorProject.created_at);
      }
    }

    const { data, error, count } = await query;

    if (error) {
      logger.error({ err: error }, 'Failed to list projects');
      throw new AppError({
        code: 'PROJECT_LIST_FAILED',
        message: 'Falha ao listar projetos',
        statusCode: 500,
      });
    }

    const projects = (data ?? []) as ProjectRow[];
    const hasMore = projects.length > options.limit;
    const items = hasMore ? projects.slice(0, options.limit) : projects;
    const nextCursor = hasMore && items.length > 0 ? items[items.length - 1].id : null;

    // Resolve image URLs (storage paths → fresh signed URLs with CDN)
    const resolvedItems = await Promise.all(
      items.map(async (p) => ({
        ...p,
        original_image_url: await imageCdnService.resolveImageUrl(p.original_image_url),
      })),
    );

    return {
      data: resolvedItems,
      pagination: {
        cursor: nextCursor,
        has_more: hasMore,
        total: count ?? 0,
      },
    };
  },

  async getById(projectId: string, userId: string, accessToken: string) {
    const client = createUserClient(accessToken);

    const { data: project, error } = await client
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .eq('user_id', userId)
      .single();

    if (error || !project) {
      throw new AppError({
        code: 'PROJECT_NOT_FOUND',
        message: 'Projeto nao encontrado',
        statusCode: 404,
      });
    }

    const proj = project as ProjectRow;

    const { count: versionsCount } = await client
      .from('project_versions')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', projectId);

    const { data: latestVersion } = await client
      .from('project_versions')
      .select('render_url')
      .eq('project_id', projectId)
      .order('version_number', { ascending: false })
      .limit(1)
      .single();

    const { data: spatialInput } = await client
      .from('spatial_inputs')
      .select('id')
      .eq('project_id', projectId)
      .limit(1)
      .single();

    const resolvedImageUrl = await imageCdnService.resolveImageUrl(proj.original_image_url);
    const resolvedThumbnail = await imageCdnService.resolveImageUrl(
      (latestVersion as { render_url: string | null } | null)?.render_url,
    );

    return {
      ...proj,
      original_image_url: resolvedImageUrl,
      versions_count: versionsCount ?? 0,
      has_spatial_input: !!spatialInput,
      latest_version_thumbnail: resolvedThumbnail,
    };
  },

  async update(projectId: string, userId: string, input: UpdateProjectInput, accessToken: string) {
    const client = createUserClient(accessToken);

    const { data: existing } = await client
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .eq('user_id', userId)
      .single();

    if (!existing) {
      throw new AppError({
        code: 'PROJECT_NOT_FOUND',
        message: 'Projeto nao encontrado',
        statusCode: 404,
      });
    }

    const updateData: Record<string, unknown> = {};
    if (input.name !== undefined) updateData.name = input.name;
    if (input.style !== undefined) updateData.style = input.style;
    if (input.room_type !== undefined) updateData.room_type = input.room_type;
    if (input.is_favorite !== undefined) updateData.is_favorite = input.is_favorite;

    const { data, error } = await client
      .from('projects')
      .update(updateData)
      .eq('id', projectId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      logger.error({ err: error }, 'Failed to update project');
      throw new AppError({
        code: 'PROJECT_UPDATE_FAILED',
        message: 'Falha ao atualizar projeto',
        statusCode: 500,
      });
    }

    return data;
  },

  async delete(projectId: string, userId: string, accessToken: string) {
    const client = createUserClient(accessToken);

    const { data: existing } = await client
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .eq('user_id', userId)
      .single();

    if (!existing) {
      throw new AppError({
        code: 'PROJECT_NOT_FOUND',
        message: 'Projeto nao encontrado',
        statusCode: 404,
      });
    }

    const { error } = await client
      .from('projects')
      .delete()
      .eq('id', projectId)
      .eq('user_id', userId);

    if (error) {
      logger.error({ err: error }, 'Failed to delete project');
      throw new AppError({
        code: 'PROJECT_DELETE_FAILED',
        message: 'Falha ao deletar projeto',
        statusCode: 500,
      });
    }

    // Clean up storage files asynchronously (fire and forget)
    supabaseAdmin.storage
      .from('project-images')
      .list(`${userId}/${projectId}`)
      .then(({ data: files }) => {
        if (files && files.length > 0) {
          const paths = files.map((f) => `${userId}/${projectId}/${f.name}`);
          supabaseAdmin.storage.from('project-images').remove(paths);
        }
      })
      .catch((err) => {
        logger.error({ err, projectId }, 'Failed to clean up project storage');
      });
  },

  async updateImageUrl(projectId: string, userId: string, imageUrl: string, accessToken: string) {
    const client = createUserClient(accessToken);

    const { error } = await client
      .from('projects')
      .update({ original_image_url: imageUrl })
      .eq('id', projectId)
      .eq('user_id', userId);

    if (error) {
      logger.error({ err: error }, 'Failed to update project image URL');
      throw new AppError({
        code: 'PROJECT_UPDATE_FAILED',
        message: 'Falha ao atualizar URL da imagem',
        statusCode: 500,
      });
    }
  },
};
