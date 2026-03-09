import { createUserClient, supabaseAdmin } from '../lib/supabase';
import { AppError } from '../lib/errors';
import { logger } from '../lib/logger';
import { subscriptionService } from './subscription.service';
import type { Database } from '@decorai/shared';

type ShareLinkRow = Database['public']['Tables']['share_links']['Row'];
type ProjectRow = Database['public']['Tables']['projects']['Row'];
type VersionRow = Database['public']['Tables']['project_versions']['Row'];

async function verifyProjectOwnership(
  projectId: string,
  userId: string,
  accessToken: string,
): Promise<ProjectRow> {
  const client = createUserClient(accessToken);
  const { data: project } = await client
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .eq('user_id', userId)
    .single();

  if (!project) {
    throw new AppError({
      code: 'PROJECT_FORBIDDEN',
      message: 'Projeto nao encontrado ou nao pertence ao usuario',
      statusCode: 403,
    });
  }

  return project as ProjectRow;
}

async function getLatestCompletedVersion(projectId: string): Promise<VersionRow | null> {
  const { data } = await supabaseAdmin
    .from('project_versions')
    .select('*')
    .eq('project_id', projectId)
    .order('version_number', { ascending: false })
    .limit(1);

  if (!data || data.length === 0) {
    return null;
  }

  return data[0] as VersionRow;
}

export const shareLinkService = {
  async getSliderData(
    projectId: string,
    userId: string,
    accessToken: string,
    versionId?: string,
  ) {
    const project = await verifyProjectOwnership(projectId, userId, accessToken);

    let version: VersionRow | null;

    if (versionId) {
      const { data } = await supabaseAdmin
        .from('project_versions')
        .select('*')
        .eq('id', versionId)
        .eq('project_id', projectId)
        .single();

      version = data as VersionRow | null;
    } else {
      version = await getLatestCompletedVersion(projectId);
    }

    if (!version) {
      throw new AppError({
        code: 'NO_RENDERED_VERSION',
        message: 'No rendered version available for comparison',
        statusCode: 404,
      });
    }

    return {
      original_url: project.original_image_url,
      rendered_url: version.render_url ?? version.image_url,
      version_id: version.id,
      project_name: project.name,
      style: project.style,
      created_at: version.created_at,
    };
  },

  async createShareLink(
    projectId: string,
    userId: string,
    accessToken: string,
    options?: { version_id?: string; expires_in_days?: number },
  ) {
    await verifyProjectOwnership(projectId, userId, accessToken);

    let versionId = options?.version_id;

    if (!versionId) {
      const latestVersion = await getLatestCompletedVersion(projectId);
      if (!latestVersion) {
        throw new AppError({
          code: 'NO_RENDERED_VERSION',
          message: 'Cannot share project without rendered version',
          statusCode: 400,
        });
      }
      versionId = latestVersion.id;
    } else {
      const { data: version } = await supabaseAdmin
        .from('project_versions')
        .select('id')
        .eq('id', versionId)
        .eq('project_id', projectId)
        .single();

      if (!version) {
        throw new AppError({
          code: 'VERSION_NOT_FOUND',
          message: 'Versao nao encontrada',
          statusCode: 404,
        });
      }
    }

    const subscription = await subscriptionService.getByUserId(userId);
    const includeWatermark = !subscription || subscription.tier === 'free';

    const expiresAt = options?.expires_in_days
      ? new Date(Date.now() + options.expires_in_days * 24 * 60 * 60 * 1000).toISOString()
      : null;

    const { data: shareLink, error } = await supabaseAdmin
      .from('share_links')
      .insert({
        project_id: projectId,
        version_id: versionId,
        include_watermark: includeWatermark,
        expires_at: expiresAt,
      })
      .select()
      .single();

    if (error || !shareLink) {
      logger.error({ err: error }, 'Failed to create share link');
      throw new AppError({
        code: 'SHARE_CREATE_FAILED',
        message: 'Falha ao criar link de compartilhamento',
        statusCode: 500,
      });
    }

    const row = shareLink as ShareLinkRow;

    return {
      share_id: row.id,
      share_url: `/share/${row.share_token}`,
      share_token: row.share_token,
      expires_at: row.expires_at,
    };
  },

  async getByToken(shareToken: string) {
    const { data: shareLink, error } = await supabaseAdmin
      .from('share_links')
      .select('*')
      .eq('share_token', shareToken)
      .single();

    if (error || !shareLink) {
      throw new AppError({
        code: 'SHARE_NOT_FOUND',
        message: 'Link de compartilhamento nao encontrado',
        statusCode: 404,
      });
    }

    const row = shareLink as ShareLinkRow;

    if (row.expires_at && new Date(row.expires_at) < new Date()) {
      throw new AppError({
        code: 'SHARE_EXPIRED',
        message: 'This share link has expired',
        statusCode: 410,
      });
    }

    // Increment view count
    await supabaseAdmin
      .from('share_links')
      .update({ view_count: row.view_count + 1 })
      .eq('id', row.id);

    // Get version and project data
    const { data: version } = await supabaseAdmin
      .from('project_versions')
      .select('*')
      .eq('id', row.version_id)
      .single();

    const { data: project } = await supabaseAdmin
      .from('projects')
      .select('name, style, original_image_url')
      .eq('id', row.project_id)
      .single();

    const versionRow = version as VersionRow | null;
    const projectRow = project as Pick<ProjectRow, 'name' | 'style' | 'original_image_url'> | null;

    // AC-5: Use processed_image_url (baked-in watermark) from render job output
    // instead of client-side watermark overlay
    let renderedUrl = versionRow?.render_url ?? versionRow?.image_url ?? null;

    if (row.include_watermark && versionRow) {
      const { data: renderJob } = await supabaseAdmin
        .from('render_jobs')
        .select('output_params')
        .eq('version_id', row.version_id)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      const outputParams = (renderJob as { output_params: Record<string, unknown> } | null)?.output_params;
      if (outputParams?.processed_image_url) {
        renderedUrl = outputParams.processed_image_url as string;
      }
    }

    return {
      original_url: projectRow?.original_image_url ?? null,
      rendered_url: renderedUrl,
      project_name: projectRow?.name ?? '',
      style: projectRow?.style ?? '',
      created_at: row.created_at,
      include_watermark: row.include_watermark,
      og: {
        title: `${projectRow?.name ?? 'Projeto'} | DecorAI`,
        description: 'Veja a transformacao do ambiente',
        image: renderedUrl,
        url: `/share/${row.share_token}`,
      },
    };
  },

  async listByProject(
    projectId: string,
    userId: string,
    accessToken: string,
  ) {
    await verifyProjectOwnership(projectId, userId, accessToken);

    const { data: shares, error } = await supabaseAdmin
      .from('share_links')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) {
      logger.error({ err: error }, 'Failed to list share links');
      throw new AppError({
        code: 'SHARES_LIST_FAILED',
        message: 'Falha ao listar links de compartilhamento',
        statusCode: 500,
      });
    }

    const rows = (shares ?? []) as ShareLinkRow[];

    return rows.map((row) => ({
      share_id: row.id,
      share_token: row.share_token,
      share_url: `/share/${row.share_token}`,
      version_id: row.version_id,
      view_count: row.view_count,
      expires_at: row.expires_at,
      created_at: row.created_at,
      is_active: true,
    }));
  },

  async deleteShareLink(
    projectId: string,
    shareId: string,
    userId: string,
    accessToken: string,
  ) {
    await verifyProjectOwnership(projectId, userId, accessToken);

    const { data: shareLink } = await supabaseAdmin
      .from('share_links')
      .select('id')
      .eq('id', shareId)
      .eq('project_id', projectId)
      .single();

    if (!shareLink) {
      throw new AppError({
        code: 'SHARE_NOT_FOUND',
        message: 'Link de compartilhamento nao encontrado',
        statusCode: 404,
      });
    }

    const { error } = await supabaseAdmin
      .from('share_links')
      .delete()
      .eq('id', shareId);

    if (error) {
      logger.error({ err: error }, 'Failed to delete share link');
      throw new AppError({
        code: 'SHARE_DELETE_FAILED',
        message: 'Falha ao excluir link de compartilhamento',
        statusCode: 500,
      });
    }
  },
};
