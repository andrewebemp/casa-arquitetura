import { randomUUID } from 'node:crypto';
import { Diagnostic, DiagnosticCta, DiagnosticResponse } from '@decorai/shared';
import { supabaseAdmin } from '../lib/supabase';
import { AppError } from '../lib/errors';
import { logger } from '../lib/logger';
import { diagnosticAnalyzerService } from './diagnostic-analyzer.service';

const DIAGNOSTIC_BUCKET = 'diagnostics';

function generateCta(overallScore: number, estimatedLossPercent: number): DiagnosticCta {
  let message: string;
  let planRecommended: 'pro' | 'business';

  if (overallScore < 40) {
    message = `Seu imovel esta perdendo ate ${estimatedLossPercent}% do valor percebido! Staging virtual profissional pode transformar completamente seu anuncio. Nao perca mais vendas.`;
    planRecommended = 'business';
  } else if (overallScore <= 70) {
    message = `Seu imovel tem potencial, mas esta perdendo cerca de ${estimatedLossPercent}% do valor percebido. Staging virtual pode destacar seu anuncio da concorrencia.`;
    planRecommended = 'pro';
  } else {
    message = 'Seu imovel ja tem boa apresentacao! Com staging virtual voce pode otimizar ainda mais e atrair compradores premium.';
    planRecommended = 'pro';
  }

  return {
    message,
    plan_recommended: planRecommended,
    upgrade_url: '/pricing',
  };
}

export const diagnosticService = {
  async createDiagnostic(params: {
    userId?: string;
    propertyType?: string;
    location?: string;
  }): Promise<{ id: string; session_token: string | null }> {
    const sessionToken = params.userId ? null : randomUUID();

    const { data, error } = await supabaseAdmin
      .from('diagnostics')
      .insert({
        user_id: params.userId ?? null,
        original_image_url: '',
        analysis: {},
        session_token: sessionToken,
      })
      .select('id, session_token')
      .single();

    if (error || !data) {
      logger.error({ error }, 'Failed to create diagnostic');
      throw new AppError({
        code: 'DIAGNOSTIC_CREATE_FAILED',
        message: 'Falha ao criar diagnostico',
        statusCode: 500,
      });
    }

    return { id: data.id, session_token: data.session_token };
  },

  async uploadImage(params: {
    diagnosticId: string;
    userId?: string;
    sessionToken?: string;
    fileBuffer: Buffer;
    mimetype: string;
  }): Promise<{ image_url: string }> {
    const { diagnosticId, userId, sessionToken, fileBuffer, mimetype } = params;

    const allowedMimes = ['image/jpeg', 'image/png'];
    if (!allowedMimes.includes(mimetype)) {
      throw new AppError({
        code: 'INVALID_FILE_TYPE',
        message: 'Formato de imagem nao suportado. Use JPEG ou PNG.',
        statusCode: 400,
      });
    }

    const MAX_SIZE = 10 * 1024 * 1024;
    if (fileBuffer.length > MAX_SIZE) {
      throw new AppError({
        code: 'FILE_TOO_LARGE',
        message: 'Imagem excede o tamanho maximo de 10MB',
        statusCode: 400,
      });
    }

    const diagnostic = await this.verifyAccess(diagnosticId, userId, sessionToken);
    if (!diagnostic) {
      throw new AppError({
        code: 'DIAGNOSTIC_NOT_FOUND',
        message: 'Diagnostico nao encontrado',
        statusCode: 404,
      });
    }

    const ext = mimetype === 'image/png' ? 'png' : 'jpg';
    const filePath = `${diagnosticId}/original.${ext}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from(DIAGNOSTIC_BUCKET)
      .upload(filePath, fileBuffer, {
        contentType: mimetype,
        upsert: true,
      });

    if (uploadError) {
      logger.error({ error: uploadError }, 'Failed to upload diagnostic image');
      throw new AppError({
        code: 'UPLOAD_FAILED',
        message: 'Falha no upload da imagem',
        statusCode: 500,
      });
    }

    const { data: publicUrl } = supabaseAdmin.storage
      .from(DIAGNOSTIC_BUCKET)
      .getPublicUrl(filePath);

    const imageUrl = publicUrl.publicUrl;

    const { error: updateError } = await supabaseAdmin
      .from('diagnostics')
      .update({ original_image_url: imageUrl })
      .eq('id', diagnosticId);

    if (updateError) {
      logger.error({ error: updateError }, 'Failed to update diagnostic image URL');
      throw new AppError({
        code: 'UPDATE_FAILED',
        message: 'Falha ao atualizar URL da imagem no diagnostico',
        statusCode: 500,
      });
    }

    const analysis = await diagnosticAnalyzerService.analyze({ imageUrl });

    const { error: analysisUpdateError } = await supabaseAdmin
      .from('diagnostics')
      .update({ analysis: analysis as unknown as Record<string, unknown> })
      .eq('id', diagnosticId);

    if (analysisUpdateError) {
      logger.error({ error: analysisUpdateError }, 'Failed to store analysis');
    }

    return { image_url: imageUrl };
  },

  async getDiagnostic(params: {
    diagnosticId: string;
    userId?: string;
    sessionToken?: string;
  }): Promise<DiagnosticResponse> {
    const { diagnosticId, userId, sessionToken } = params;

    const diagnostic = await this.verifyAccess(diagnosticId, userId, sessionToken);
    if (!diagnostic) {
      throw new AppError({
        code: 'DIAGNOSTIC_NOT_FOUND',
        message: 'Diagnostico nao encontrado',
        statusCode: 404,
      });
    }

    const typedDiagnostic = diagnostic as unknown as Diagnostic;
    const analysis = typedDiagnostic.analysis;
    const cta = generateCta(
      analysis.overall_score ?? 50,
      analysis.estimated_loss_percent ?? 20,
    );

    return {
      ...typedDiagnostic,
      cta,
    };
  },

  async linkAnonymousDiagnostics(params: {
    sessionToken: string;
    userId: string;
  }): Promise<number> {
    const { sessionToken, userId } = params;

    const { data, error } = await supabaseAdmin
      .from('diagnostics')
      .update({ user_id: userId })
      .eq('session_token', sessionToken)
      .is('user_id', null)
      .select('id');

    if (error) {
      logger.error({ error }, 'Failed to link anonymous diagnostics');
      throw new AppError({
        code: 'LINK_FAILED',
        message: 'Falha ao vincular diagnosticos anonimos',
        statusCode: 500,
      });
    }

    const count = data?.length ?? 0;
    if (count > 0) {
      logger.info({ userId, sessionToken, count }, 'Linked anonymous diagnostics to user');
    }

    return count;
  },

  async verifyAccess(
    diagnosticId: string,
    userId?: string,
    sessionToken?: string,
  ): Promise<Record<string, unknown> | null> {
    let query = supabaseAdmin
      .from('diagnostics')
      .select('*')
      .eq('id', diagnosticId);

    if (userId) {
      query = query.eq('user_id', userId);
    } else if (sessionToken) {
      query = query.eq('session_token', sessionToken);
    } else {
      return null;
    }

    const { data, error } = await query.single();

    if (error || !data) {
      return null;
    }

    return data as Record<string, unknown>;
  },
};
