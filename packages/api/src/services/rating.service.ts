import { supabaseAdmin } from '../lib/supabase';
import { getRedisClient } from '../lib/redis';
import { AppError } from '../lib/errors';
import { logger } from '../lib/logger';
import type { Database } from '@decorai/shared';

type RenderRatingRow = Database['public']['Tables']['render_ratings']['Row'];
type NpsResponseRow = Database['public']['Tables']['nps_responses']['Row'];

const ANALYTICS_CACHE_TTL = 300; // 5 minutes

export const ratingService = {
  async upsertRating(
    renderId: string,
    userId: string,
    data: { score: number; tags?: string[]; comment?: string },
  ): Promise<RenderRatingRow> {
    const { data: existing } = await supabaseAdmin
      .from('render_ratings')
      .select('id')
      .eq('render_id', renderId)
      .eq('user_id', userId)
      .single();

    let result: RenderRatingRow;

    if (existing) {
      const { data: updated, error } = await supabaseAdmin
        .from('render_ratings')
        .update({
          score: data.score,
          tags: data.tags ?? [],
          comment: data.comment ?? null,
        })
        .eq('id', (existing as { id: string }).id)
        .select()
        .single();

      if (error || !updated) {
        logger.error({ err: error }, 'Failed to update rating');
        throw new AppError({ code: 'RATING_UPDATE_FAILED', message: 'Falha ao atualizar avaliacao', statusCode: 500 });
      }
      result = updated as RenderRatingRow;
    } else {
      const { data: created, error } = await supabaseAdmin
        .from('render_ratings')
        .insert({
          render_id: renderId,
          user_id: userId,
          score: data.score,
          tags: data.tags ?? [],
          comment: data.comment ?? null,
        })
        .select()
        .single();

      if (error || !created) {
        logger.error({ err: error }, 'Failed to create rating');
        throw new AppError({ code: 'RATING_CREATE_FAILED', message: 'Falha ao criar avaliacao', statusCode: 500 });
      }
      result = created as RenderRatingRow;
    }

    await this.invalidateAnalyticsCache();
    return result;
  },

  async getRating(renderId: string, userId: string): Promise<RenderRatingRow | null> {
    const { data } = await supabaseAdmin
      .from('render_ratings')
      .select('*')
      .eq('render_id', renderId)
      .eq('user_id', userId)
      .single();

    return (data as RenderRatingRow | null) ?? null;
  },

  async submitNps(
    userId: string,
    data: { score: number; comment?: string },
  ): Promise<NpsResponseRow> {
    // Get user subscription info for context
    const { data: sub } = await supabaseAdmin
      .from('subscriptions')
      .select('tier, renders_used')
      .eq('user_id', userId)
      .single();

    const userTier = (sub as { tier: string; renders_used: number } | null)?.tier ?? 'free';
    const totalRenders = (sub as { tier: string; renders_used: number } | null)?.renders_used ?? 0;

    const { data: nps, error } = await supabaseAdmin
      .from('nps_responses')
      .insert({
        user_id: userId,
        score: data.score,
        comment: data.comment ?? null,
        user_tier: userTier,
        total_renders: totalRenders,
      })
      .select()
      .single();

    if (error || !nps) {
      logger.error({ err: error }, 'Failed to submit NPS');
      throw new AppError({ code: 'NPS_SUBMIT_FAILED', message: 'Falha ao enviar NPS', statusCode: 500 });
    }

    // Update last prompted timestamp
    await supabaseAdmin
      .from('user_profiles')
      .update({ nps_last_prompted_at: new Date().toISOString() })
      .eq('id', userId);

    await this.invalidateAnalyticsCache();
    return nps as NpsResponseRow;
  },

  async dismissNps(userId: string): Promise<void> {
    await supabaseAdmin
      .from('user_profiles')
      .update({ nps_last_prompted_at: new Date().toISOString() })
      .eq('id', userId);
  },

  async shouldShowNps(userId: string): Promise<boolean> {
    // Check renders count >= 3
    const { data: sub } = await supabaseAdmin
      .from('subscriptions')
      .select('renders_used')
      .eq('user_id', userId)
      .single();

    const rendersUsed = (sub as { renders_used: number } | null)?.renders_used ?? 0;
    if (rendersUsed < 3) return false;

    // Check 30-day cooldown
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('nps_last_prompted_at')
      .eq('id', userId)
      .single();

    const lastPrompted = (profile as { nps_last_prompted_at: string | null } | null)?.nps_last_prompted_at;
    if (lastPrompted) {
      const daysSince = (Date.now() - new Date(lastPrompted).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSince < 30) return false;
    }

    return true;
  },

  async getRatingAnalytics(filters?: { from?: string; to?: string; style?: string }): Promise<Record<string, unknown>> {
    const cacheKey = `analytics:ratings:${JSON.stringify(filters ?? {})}`;
    const redis = getRedisClient();

    try {
      const cached = await redis.get(cacheKey);
      if (cached) return JSON.parse(cached);
    } catch {
      // Redis failure is non-fatal
    }

    let query = supabaseAdmin.from('render_ratings').select('*');

    if (filters?.from) {
      query = query.gte('created_at', filters.from);
    }
    if (filters?.to) {
      query = query.lte('created_at', filters.to);
    }

    const { data: ratings } = await query;
    const rows = (ratings ?? []) as RenderRatingRow[];

    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const byTag: Record<string, { frequency: number; total_score: number }> = {};
    let totalScore = 0;

    for (const r of rows) {
      totalScore += r.score;
      distribution[r.score] = (distribution[r.score] ?? 0) + 1;
      for (const tag of r.tags) {
        if (!byTag[tag]) byTag[tag] = { frequency: 0, total_score: 0 };
        byTag[tag].frequency += 1;
        byTag[tag].total_score += r.score;
      }
    }

    const result = {
      average_score: rows.length > 0 ? Math.round((totalScore / rows.length) * 100) / 100 : 0,
      total_ratings: rows.length,
      distribution,
      by_tag: Object.fromEntries(
        Object.entries(byTag).map(([tag, v]) => [
          tag,
          { frequency: v.frequency, average_score: Math.round((v.total_score / v.frequency) * 100) / 100 },
        ]),
      ),
    };

    try {
      await redis.setex(cacheKey, ANALYTICS_CACHE_TTL, JSON.stringify(result));
    } catch {
      // Redis failure is non-fatal
    }

    return result;
  },

  async getNpsAnalytics(filters?: { from?: string; to?: string; tier?: string }): Promise<Record<string, unknown>> {
    const cacheKey = `analytics:nps:${JSON.stringify(filters ?? {})}`;
    const redis = getRedisClient();

    try {
      const cached = await redis.get(cacheKey);
      if (cached) return JSON.parse(cached);
    } catch {
      // Redis failure is non-fatal
    }

    let query = supabaseAdmin.from('nps_responses').select('*');

    if (filters?.from) {
      query = query.gte('created_at', filters.from);
    }
    if (filters?.to) {
      query = query.lte('created_at', filters.to);
    }
    if (filters?.tier) {
      query = query.eq('user_tier', filters.tier);
    }

    const { data: responses } = await query;
    const rows = (responses ?? []) as NpsResponseRow[];

    const distribution: Record<number, number> = {};
    let promoters = 0;
    let passives = 0;
    let detractors = 0;

    for (const r of rows) {
      distribution[r.score] = (distribution[r.score] ?? 0) + 1;
      if (r.score >= 9) promoters++;
      else if (r.score >= 7) passives++;
      else detractors++;
    }

    const total = rows.length;
    const npsScore = total > 0 ? Math.round(((promoters - detractors) / total) * 100) : 0;

    const themes = this.extractThemes(rows.map((r) => r.comment).filter(Boolean) as string[]);

    const result = {
      nps_score: npsScore,
      total_responses: total,
      promoters,
      passives,
      detractors,
      distribution,
      themes,
    };

    try {
      await redis.setex(cacheKey, ANALYTICS_CACHE_TTL, JSON.stringify(result));
    } catch {
      // Redis failure is non-fatal
    }

    return result;
  },

  extractThemes(comments: string[]): string[] {
    const keywords: Record<string, string[]> = {
      'qualidade da imagem': ['qualidade', 'imagem', 'resolucao', 'nitidez'],
      'facilidade de uso': ['facil', 'intuitivo', 'simples', 'pratico'],
      'velocidade': ['rapido', 'lento', 'demora', 'velocidade'],
      'variedade de estilos': ['estilo', 'variedade', 'opcoes'],
      'preco': ['preco', 'caro', 'barato', 'valor', 'custo'],
      'realismo': ['realista', 'real', 'realismo', 'natural'],
    };

    const found = new Set<string>();
    const lowerComments = comments.map((c) => c.toLowerCase());

    for (const [theme, words] of Object.entries(keywords)) {
      for (const comment of lowerComments) {
        if (words.some((w) => comment.includes(w))) {
          found.add(theme);
          break;
        }
      }
    }

    return [...found];
  },

  async invalidateAnalyticsCache(): Promise<void> {
    try {
      const redis = getRedisClient();
      const keys = await redis.keys('analytics:*');
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch {
      // Redis failure is non-fatal
    }
  },
};
