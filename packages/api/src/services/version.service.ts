import { createUserClient, supabaseAdmin } from '../lib/supabase';
import { AppError } from '../lib/errors';
import { logger } from '../lib/logger';
import type { Database } from '@decorai/shared';

type VersionRow = Database['public']['Tables']['project_versions']['Row'];

async function verifyProjectOwnership(
  projectId: string,
  userId: string,
  accessToken: string,
): Promise<void> {
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
      statusCode: 403,
    });
  }
}

export const versionService = {
  async list(projectId: string, userId: string, accessToken: string) {
    await verifyProjectOwnership(projectId, userId, accessToken);

    const { data: versions, error } = await supabaseAdmin
      .from('project_versions')
      .select('*')
      .eq('project_id', projectId)
      .order('version_number', { ascending: true });

    if (error) {
      logger.error({ err: error }, 'Failed to list versions');
      throw new AppError({
        code: 'VERSIONS_LIST_FAILED',
        message: 'Falha ao listar versoes',
        statusCode: 500,
      });
    }

    return versions ?? [];
  },

  async getById(
    projectId: string,
    versionId: string,
    userId: string,
    accessToken: string,
  ) {
    await verifyProjectOwnership(projectId, userId, accessToken);

    const { data: version, error } = await supabaseAdmin
      .from('project_versions')
      .select('*')
      .eq('id', versionId)
      .eq('project_id', projectId)
      .single();

    if (error || !version) {
      throw new AppError({
        code: 'VERSION_NOT_FOUND',
        message: 'Versao nao encontrada',
        statusCode: 404,
      });
    }

    return version;
  },

  async revert(
    projectId: string,
    versionId: string,
    userId: string,
    accessToken: string,
  ) {
    await verifyProjectOwnership(projectId, userId, accessToken);

    // Get the version to revert to
    const { data: targetVersion, error: fetchError } = await supabaseAdmin
      .from('project_versions')
      .select('*')
      .eq('id', versionId)
      .eq('project_id', projectId)
      .single();

    if (fetchError || !targetVersion) {
      throw new AppError({
        code: 'VERSION_NOT_FOUND',
        message: 'Versao nao encontrada',
        statusCode: 404,
      });
    }

    const target = targetVersion as VersionRow;

    // Get the latest version number
    const { data: latestVersions } = await supabaseAdmin
      .from('project_versions')
      .select('version_number')
      .eq('project_id', projectId)
      .order('version_number', { ascending: false })
      .limit(1);

    const versionRows = latestVersions as Array<{ version_number: number }> | null;
    const nextVersion = (versionRows && versionRows.length > 0)
      ? versionRows[0].version_number + 1
      : 1;

    // Create new version copying the target's image (non-destructive revert)
    const { data: newVersion, error: insertError } = await supabaseAdmin
      .from('project_versions')
      .insert({
        project_id: projectId,
        version_number: nextVersion,
        image_url: target.image_url,
        thumbnail_url: target.thumbnail_url,
        prompt: target.prompt,
        refinement_command: `revert_to_v${target.version_number}`,
        metadata: {
          ...target.metadata,
          reverted_from_version_id: versionId,
          reverted_from_version_number: target.version_number,
        },
      })
      .select()
      .single();

    if (insertError || !newVersion) {
      logger.error({ err: insertError }, 'Failed to create reverted version');
      throw new AppError({
        code: 'VERSION_REVERT_FAILED',
        message: 'Falha ao reverter versao',
        statusCode: 500,
      });
    }

    return newVersion;
  },
};
