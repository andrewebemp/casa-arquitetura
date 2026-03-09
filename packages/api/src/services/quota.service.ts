import { supabaseAdmin } from '../lib/supabase';
import { TIER_LIMITS } from '@decorai/shared';
import { AppError } from '../lib/errors';
import { logger } from '../lib/logger';
import type { SubscriptionTier } from '@decorai/shared';

interface QuotaResult {
  allowed: boolean;
  renders_used: number;
  renders_limit: number;
  remaining: number;
  tier: SubscriptionTier;
}

export const quotaService = {
  async getUserTier(userId: string): Promise<SubscriptionTier> {
    const { data, error } = await supabaseAdmin
      .from('subscriptions')
      .select('tier')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (error || !data) {
      return 'free';
    }

    return data.tier as SubscriptionTier;
  },

  async getMonthlyRenderCount(userId: string): Promise<number> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    // Get user's project IDs first, then count render jobs
    const { data: projects, error: projError } = await supabaseAdmin
      .from('projects')
      .select('id')
      .eq('user_id', userId);

    if (projError) {
      logger.error({ err: projError }, 'Failed to get user projects for quota check');
      throw new AppError({
        code: 'QUOTA_CHECK_FAILED',
        message: 'Falha ao verificar quota de renders',
        statusCode: 500,
      });
    }

    if (!projects || projects.length === 0) {
      return 0;
    }

    const projectIds = projects.map((p) => p.id);

    const { count, error } = await supabaseAdmin
      .from('render_jobs')
      .select('*', { count: 'exact', head: true })
      .in('project_id', projectIds)
      .gte('created_at', startOfMonth)
      .in('status', ['queued', 'processing', 'completed']);

    if (error) {
      logger.error({ err: error }, 'Failed to get monthly render count');
      throw new AppError({
        code: 'QUOTA_CHECK_FAILED',
        message: 'Falha ao verificar quota de renders',
        statusCode: 500,
      });
    }

    return count ?? 0;
  },

  async checkQuota(userId: string): Promise<QuotaResult> {
    const tier = await this.getUserTier(userId);
    const rendersUsed = await this.getMonthlyRenderCount(userId);
    const limits = TIER_LIMITS[tier];
    const remaining = Math.max(0, limits.renders_limit - rendersUsed);

    return {
      allowed: remaining > 0,
      renders_used: rendersUsed,
      renders_limit: limits.renders_limit,
      remaining,
      tier,
    };
  },

  async enforceQuota(userId: string): Promise<QuotaResult> {
    const quota = await this.checkQuota(userId);

    if (!quota.allowed) {
      throw new AppError({
        code: 'QUOTA_EXCEEDED',
        message: `Quota de renders excedida. Limite mensal: ${quota.renders_limit}. Restante: 0`,
        statusCode: 429,
      });
    }

    return quota;
  },
};
