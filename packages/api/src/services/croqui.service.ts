import { createUserClient, supabaseAdmin } from '../lib/supabase';
import { getAnthropicClient } from '../lib/anthropic';
import { AppError } from '../lib/errors';
import { logger } from '../lib/logger';

const CROQUI_MODEL = 'claude-sonnet-4-20250514';
const MAX_TURNS = 3;

const SYSTEM_PROMPT = `You are an ASCII floor plan generator for interior design.
Given room dimensions, openings (doors/windows), and furniture items, generate a clear ASCII floor plan.

Rules:
- Use + for corners, - for horizontal walls, | for vertical walls
- Mark doors with D, windows with W
- Label furniture items with their first few characters inside the plan
- Show dimensions on the outside edges (width x length in meters)
- Scale: each character represents ~0.25m
- Keep the plan clean and readable
- Always output ONLY the ASCII art, no explanations`;

const ADJUST_SYSTEM_PROMPT = `You are an ASCII floor plan editor for interior design.
Given the current ASCII floor plan and user adjustment instructions, produce an updated plan.

Rules:
- Preserve the same ASCII style: + corners, - horizontal, | vertical walls
- Mark doors with D, windows with W
- Apply the user's requested changes precisely
- Keep dimensions consistent
- Always output ONLY the updated ASCII art, no explanations`;

interface SpatialData {
  dimensions: Record<string, unknown> | null;
  openings: Record<string, unknown>[];
  items: Record<string, unknown>[];
}

interface SpatialRow {
  id: string;
  project_id: string;
  dimensions: Record<string, unknown> | null;
  openings: Record<string, unknown>[] | null;
  items: Record<string, unknown>[] | null;
  croqui_ascii: string | null;
  croqui_turn_number: number | null;
  croqui_approved: boolean | null;
}

function buildGenerationPrompt(spatial: SpatialData): string {
  const dims = spatial.dimensions as { width?: number; length?: number; height?: number } | null;
  const width = dims?.width ?? dims?.width ?? 0;
  const length = dims?.length ?? dims?.length ?? 0;
  const height = dims?.height ?? 0;

  let prompt = 'Generate an ASCII floor plan for a room with these specifications:\n';
  prompt += `- Dimensions: ${width}m (width) x ${length}m (length) x ${height}m (height)\n`;

  if (spatial.openings && spatial.openings.length > 0) {
    prompt += '\nOpenings:\n';
    for (const opening of spatial.openings) {
      const o = opening as { type?: string; wall?: string; width?: number; height?: number };
      prompt += `- ${o.type ?? 'opening'} on ${o.wall ?? 'unknown'} wall (${o.width ?? 0}m x ${o.height ?? 0}m)\n`;
    }
  }

  if (spatial.items && spatial.items.length > 0) {
    prompt += '\nFurniture items:\n';
    for (const item of spatial.items) {
      const i = item as { name?: string; width?: number; depth?: number; position?: string };
      prompt += `- ${i.name ?? 'item'}`;
      if (i.width || i.depth) {
        prompt += ` (${i.width ?? '?'}m x ${i.depth ?? '?'}m)`;
      }
      if (i.position) {
        prompt += ` at position: ${i.position}`;
      }
      prompt += '\n';
    }
  }

  return prompt;
}

function buildAdjustPrompt(currentCroqui: string, instructions: string): string {
  return `Current floor plan:\n\`\`\`\n${currentCroqui}\n\`\`\`\n\nAdjustment instructions: ${instructions}\n\nGenerate the updated floor plan:`;
}

async function callClaude(systemPrompt: string, userPrompt: string): Promise<string> {
  const anthropic = getAnthropicClient();

  const message = await anthropic.messages.create({
    model: CROQUI_MODEL,
    max_tokens: 2048,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  });

  const textBlock = message.content.find((block: { type: string }) => block.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    throw new AppError({
      code: 'CROQUI_GENERATION_FAILED',
      message: 'Falha ao gerar croqui: resposta vazia do modelo',
      statusCode: 500,
    });
  }

  return textBlock.text.trim();
}

async function verifyProjectOwnership(
  projectId: string,
  userId: string,
  accessToken: string,
): Promise<{ id: string; original_image_url: string | null; status: string }> {
  const client = createUserClient(accessToken);
  const { data: project } = await client
    .from('projects')
    .select('id, original_image_url, status')
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

  return project;
}

export const croquiService = {
  async generate(projectId: string, userId: string, accessToken: string) {
    await verifyProjectOwnership(projectId, userId, accessToken);

    const client = createUserClient(accessToken);
    const { data } = await client
      .from('spatial_inputs')
      .select('*')
      .eq('project_id', projectId)
      .single();

    const spatial = data as SpatialRow | null;

    if (!spatial) {
      throw new AppError({
        code: 'SPATIAL_INPUT_NOT_FOUND',
        message: 'Dados espaciais nao encontrados. Envie dados espaciais antes de gerar o croqui.',
        statusCode: 404,
      });
    }

    if (!spatial.dimensions) {
      throw new AppError({
        code: 'VALIDATION_ERROR',
        message: 'Dimensoes do ambiente sao obrigatorias para gerar o croqui.',
        statusCode: 400,
      });
    }

    const prompt = buildGenerationPrompt({
      dimensions: spatial.dimensions,
      openings: spatial.openings ?? [],
      items: spatial.items ?? [],
    });

    const croquiAscii = await callClaude(SYSTEM_PROMPT, prompt);

    const { data: updated, error } = await supabaseAdmin
      .from('spatial_inputs')
      .update({
        croqui_ascii: croquiAscii,
        croqui_turn_number: 1,
        croqui_approved: false,
        updated_at: new Date().toISOString(),
      })
      .eq('project_id', projectId)
      .select()
      .single();

    if (error) {
      logger.error({ err: error }, 'Failed to store croqui');
      throw new AppError({
        code: 'CROQUI_STORE_FAILED',
        message: 'Falha ao armazenar croqui',
        statusCode: 500,
      });
    }

    return updated as SpatialRow;
  },

  async getCroqui(projectId: string, userId: string, accessToken: string) {
    await verifyProjectOwnership(projectId, userId, accessToken);

    const client = createUserClient(accessToken);
    const { data } = await client
      .from('spatial_inputs')
      .select('*')
      .eq('project_id', projectId)
      .single();

    const spatial = data as SpatialRow | null;

    if (!spatial) {
      throw new AppError({
        code: 'SPATIAL_INPUT_NOT_FOUND',
        message: 'Dados espaciais nao encontrados para este projeto',
        statusCode: 404,
      });
    }

    if (!spatial.croqui_ascii) {
      throw new AppError({
        code: 'CROQUI_NOT_FOUND',
        message: 'Croqui ainda nao foi gerado para este projeto',
        statusCode: 404,
      });
    }

    return {
      croqui_ascii: spatial.croqui_ascii,
      turn_number: spatial.croqui_turn_number ?? 1,
      approved: spatial.croqui_approved ?? false,
      dimensions: spatial.dimensions,
      openings: spatial.openings,
      items: spatial.items,
    };
  },

  async adjust(projectId: string, userId: string, instructions: string, accessToken: string) {
    await verifyProjectOwnership(projectId, userId, accessToken);

    const client = createUserClient(accessToken);
    const { data } = await client
      .from('spatial_inputs')
      .select('*')
      .eq('project_id', projectId)
      .single();

    const spatial = data as SpatialRow | null;

    if (!spatial) {
      throw new AppError({
        code: 'SPATIAL_INPUT_NOT_FOUND',
        message: 'Dados espaciais nao encontrados para este projeto',
        statusCode: 404,
      });
    }

    if (!spatial.croqui_ascii) {
      throw new AppError({
        code: 'CROQUI_NOT_FOUND',
        message: 'Croqui ainda nao foi gerado. Gere um croqui antes de ajustar.',
        statusCode: 400,
      });
    }

    const currentTurn = spatial.croqui_turn_number ?? 1;
    if (currentTurn >= MAX_TURNS) {
      throw new AppError({
        code: 'CROQUI_MAX_TURNS_REACHED',
        message: 'Maximo de 3 rodadas de refinamento atingido. Aprove ou reinicie o croqui.',
        statusCode: 422,
      });
    }

    if (spatial.croqui_approved) {
      throw new AppError({
        code: 'CROQUI_ALREADY_APPROVED',
        message: 'Croqui ja foi aprovado. Nao e possivel ajustar apos aprovacao.',
        statusCode: 409,
      });
    }

    const prompt = buildAdjustPrompt(spatial.croqui_ascii, instructions);
    const updatedCroqui = await callClaude(ADJUST_SYSTEM_PROMPT, prompt);

    const newTurn = currentTurn + 1;
    const { error } = await supabaseAdmin
      .from('spatial_inputs')
      .update({
        croqui_ascii: updatedCroqui,
        croqui_turn_number: newTurn,
        updated_at: new Date().toISOString(),
      })
      .eq('project_id', projectId);

    if (error) {
      logger.error({ err: error }, 'Failed to update croqui');
      throw new AppError({
        code: 'CROQUI_UPDATE_FAILED',
        message: 'Falha ao atualizar croqui',
        statusCode: 500,
      });
    }

    return {
      croqui_ascii: updatedCroqui,
      turn_number: newTurn,
      approved: false,
    };
  },

  async approve(projectId: string, userId: string, accessToken: string) {
    await verifyProjectOwnership(projectId, userId, accessToken);

    const client = createUserClient(accessToken);
    const { data } = await client
      .from('spatial_inputs')
      .select('*')
      .eq('project_id', projectId)
      .single();

    const spatial = data as SpatialRow | null;

    if (!spatial) {
      throw new AppError({
        code: 'SPATIAL_INPUT_NOT_FOUND',
        message: 'Dados espaciais nao encontrados para este projeto',
        statusCode: 404,
      });
    }

    if (!spatial.croqui_ascii) {
      throw new AppError({
        code: 'CROQUI_NOT_FOUND',
        message: 'Croqui ainda nao foi gerado. Gere um croqui antes de aprovar.',
        statusCode: 400,
      });
    }

    if (spatial.croqui_approved) {
      throw new AppError({
        code: 'CROQUI_ALREADY_APPROVED',
        message: 'Croqui ja foi aprovado',
        statusCode: 409,
      });
    }

    // Mark croqui as approved
    const { error: updateError } = await supabaseAdmin
      .from('spatial_inputs')
      .update({
        croqui_approved: true,
        updated_at: new Date().toISOString(),
      })
      .eq('project_id', projectId);

    if (updateError) {
      logger.error({ err: updateError }, 'Failed to approve croqui');
      throw new AppError({
        code: 'CROQUI_APPROVE_FAILED',
        message: 'Falha ao aprovar croqui',
        statusCode: 500,
      });
    }

    // Get next version number
    const { data: versions } = await supabaseAdmin
      .from('project_versions')
      .select('version_number')
      .eq('project_id', projectId)
      .order('version_number', { ascending: false })
      .limit(1);

    const versionRows = versions as Array<{ version_number: number }> | null;
    const nextVersion = (versionRows && versionRows.length > 0) ? versionRows[0].version_number + 1 : 1;

    // Create project_version record for croqui approval
    const { data: version, error: versionError } = await supabaseAdmin
      .from('project_versions')
      .insert({
        project_id: projectId,
        version_number: nextVersion,
        image_url: '',
        thumbnail_url: '',
        prompt: 'croqui_approved',
        metadata: {
          type: 'croqui_approved',
          croqui_ascii: spatial.croqui_ascii,
          turn_number: spatial.croqui_turn_number ?? 1,
        },
      })
      .select()
      .single();

    if (versionError) {
      logger.error({ err: versionError }, 'Failed to create project version for croqui');
      throw new AppError({
        code: 'CROQUI_VERSION_FAILED',
        message: 'Falha ao registrar versao do croqui',
        statusCode: 500,
      });
    }

    // Update project status to croqui_review
    await supabaseAdmin
      .from('projects')
      .update({ status: 'croqui_review', updated_at: new Date().toISOString() })
      .eq('id', projectId);

    return {
      approved: true,
      croqui_ascii: spatial.croqui_ascii,
      turn_number: spatial.croqui_turn_number ?? 1,
      version_id: (version as { id: string }).id,
    };
  },
};
