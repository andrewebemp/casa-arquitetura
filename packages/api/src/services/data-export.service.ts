import { supabaseAdmin } from '../lib/supabase';
import { AppError } from '../lib/errors';
import { logger } from '../lib/logger';

export const dataExportService = {
  async exportUserData(userId: string) {
    const [profile, projects, subscriptions, diagnostics] = await Promise.all([
      supabaseAdmin.from('user_profiles').select('*').eq('id', userId).single(),
      supabaseAdmin.from('projects').select('*').eq('user_id', userId),
      supabaseAdmin.from('subscriptions').select('*').eq('user_id', userId),
      supabaseAdmin.from('diagnostics').select('*').eq('user_id', userId),
    ]);

    if (profile.error) {
      logger.error({ err: profile.error, userId }, 'Failed to export user data');
      throw new AppError({
        code: 'DATA_EXPORT_FAILED',
        message: 'Falha ao exportar dados do usuario',
        statusCode: 500,
      });
    }

    const projectsList = (projects.data ?? []) as { id: string }[];
    const projectIds = projectsList.map((p) => p.id);

    let versions: Record<string, unknown>[] = [];
    let renderJobs: Record<string, unknown>[] = [];
    let chatMessages: Record<string, unknown>[] = [];

    if (projectIds.length > 0) {
      const [versionsResult, renderJobsResult, chatMessagesResult] = await Promise.all([
        supabaseAdmin.from('project_versions').select('*').in('project_id', projectIds),
        supabaseAdmin.from('render_jobs').select('*').in('project_id', projectIds),
        supabaseAdmin.from('chat_messages').select('*').in('project_id', projectIds),
      ]);

      versions = (versionsResult.data ?? []) as Record<string, unknown>[];
      renderJobs = (renderJobsResult.data ?? []) as Record<string, unknown>[];
      chatMessages = (chatMessagesResult.data ?? []) as Record<string, unknown>[];
    }

    return {
      exported_at: new Date().toISOString(),
      user: {
        profile: profile.data,
        subscription: subscriptions.data ?? [],
      },
      projects: projects.data ?? [],
      project_versions: versions,
      render_jobs: renderJobs,
      chat_messages: chatMessages,
      diagnostics: diagnostics.data ?? [],
    };
  },
};
