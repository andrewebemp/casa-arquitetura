import { createUserClient, supabaseAdmin } from '../lib/supabase';
import { chatCompletion } from '../lib/llm';
import { AppError } from '../lib/errors';
import { logger } from '../lib/logger';
import { enqueueRenderJob } from '../queue/render.queue';
import { quotaService } from './quota.service';
import { chatEvents } from '../queue/chat.events';
import type { RefinementOperation } from '@decorai/shared';

const NLU_SYSTEM_PROMPT = `You are a natural language understanding engine for DecorAI, an interior design application.
Your job is to interpret user commands in Brazilian Portuguese and extract structured operations for room refinement.

The user is looking at a rendered room image and wants to make changes. Parse their request into one or more operations.

Operation types:
- "remove": Remove an element from the scene (e.g., "tira o tapete", "remove a poltrona")
- "change": Change properties of an existing element (e.g., "muda o piso para madeira clara", "troca a cor da parede para azul")
- "add": Add a new element to the scene (e.g., "coloca um vaso na mesa", "adiciona uma luminaria pendente")
- "adjust": Adjust lighting, mood, ambiance, or style parameters (e.g., "deixa mais aconchegante", "iluminacao mais quente", "mais minimalista")

For each operation, provide:
- type: one of "remove", "change", "add", "adjust"
- target: the element being affected (in Portuguese, lowercase)
- params: additional parameters as key-value pairs (e.g., material, color, style, position, intensity)

IMPORTANT: Always respond with ONLY a valid JSON array of operations. No explanations.

Example input: "tira o tapete e muda o piso para madeira clara"
Example output: [{"type":"remove","target":"tapete","params":{}},{"type":"change","target":"piso","params":{"material":"madeira clara"}}]

Example input: "deixa mais aconchegante com iluminacao quente"
Example output: [{"type":"adjust","target":"ambiente","params":{"mood":"aconchegante","lighting":"quente"}}]

Example input: "coloca uma planta no canto e remove a cadeira"
Example output: [{"type":"add","target":"planta","params":{"position":"canto"}},{"type":"remove","target":"cadeira","params":{}}]`;

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

async function extractOperations(message: string, spatialContext: string): Promise<RefinementOperation[]> {
  const userPrompt = spatialContext
    ? `Context about the room:\n${spatialContext}\n\nUser command: ${message}`
    : `User command: ${message}`;

  const response = await chatCompletion({
    system: NLU_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userPrompt }],
    maxTokens: 1024,
  });

  try {
    const operations = JSON.parse(response.text.trim()) as RefinementOperation[];
    if (!Array.isArray(operations)) {
      throw new Error('Response is not an array');
    }
    return operations;
  } catch {
    logger.error({ raw: response.text }, 'Failed to parse NLU response as JSON');
    throw new AppError({
      code: 'NLU_PARSE_FAILED',
      message: 'Falha ao interpretar comando: resposta invalida do modelo',
      statusCode: 500,
    });
  }
}

export const chatService = {
  async sendMessage(
    projectId: string,
    userId: string,
    message: string,
    accessToken: string,
  ) {
    await verifyProjectOwnership(projectId, userId, accessToken);

    // Get spatial context for NLU
    const { data: spatial } = await supabaseAdmin
      .from('spatial_inputs')
      .select('dimensions, openings, items')
      .eq('project_id', projectId)
      .single();

    let spatialContext = '';
    if (spatial) {
      const parts: string[] = [];
      if (spatial.dimensions) {
        const dims = spatial.dimensions as { width?: number; length?: number };
        parts.push(`Room: ${dims.width ?? 0}m x ${dims.length ?? 0}m`);
      }
      if (spatial.items && Array.isArray(spatial.items) && spatial.items.length > 0) {
        const itemNames = spatial.items.map((i: Record<string, unknown>) => (i as { name?: string }).name ?? 'item');
        parts.push(`Items: ${itemNames.join(', ')}`);
      }
      spatialContext = parts.join('. ');
    }

    // Extract operations via LLM NLU
    const operations = await extractOperations(message, spatialContext);

    // Save user chat message
    const { data: chatMessage, error: chatError } = await supabaseAdmin
      .from('chat_messages')
      .insert({
        project_id: projectId,
        role: 'user' as const,
        content: message,
        operations: operations as unknown as Record<string, unknown>,
      })
      .select()
      .single();

    if (chatError || !chatMessage) {
      logger.error({ err: chatError }, 'Failed to save chat message');
      throw new AppError({
        code: 'CHAT_MESSAGE_SAVE_FAILED',
        message: 'Falha ao salvar mensagem',
        statusCode: 500,
      });
    }

    // Check quota and get tier for priority
    const quota = await quotaService.enforceQuota(userId);

    // Create render job in DB with type 'refinement'
    const { data: renderJob, error: jobError } = await supabaseAdmin
      .from('render_jobs')
      .insert({
        project_id: projectId,
        type: 'refinement' as const,
        status: 'queued',
        priority: quota.tier === 'business' ? 1 : quota.tier === 'pro' ? 5 : 10,
        input_params: {
          chat_message_id: (chatMessage as { id: string }).id,
          operations,
          source_project_id: projectId,
        },
      })
      .select()
      .single();

    if (jobError || !renderJob) {
      logger.error({ err: jobError }, 'Failed to create refinement job');
      throw new AppError({
        code: 'REFINEMENT_JOB_CREATE_FAILED',
        message: 'Falha ao criar job de refinamento',
        statusCode: 500,
      });
    }

    const jobId = (renderJob as { id: string }).id;

    // Enqueue in BullMQ
    await enqueueRenderJob(
      {
        jobId,
        projectId,
        userId,
        type: 'refinement',
        inputParams: {
          chat_message_id: (chatMessage as { id: string }).id,
          operations,
        },
      },
      quota.tier,
    );

    // Broadcast "refining" status
    await chatEvents.broadcast({
      projectId,
      status: 'refining',
      chatMessageId: (chatMessage as { id: string }).id,
      jobId,
    });

    return {
      chat_message_id: (chatMessage as { id: string }).id,
      job_id: jobId,
      operations,
    };
  },

  async getHistory(
    projectId: string,
    userId: string,
    accessToken: string,
    limit: number,
    cursor?: string,
  ) {
    await verifyProjectOwnership(projectId, userId, accessToken);

    let query = supabaseAdmin
      .from('chat_messages')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true })
      .limit(limit);

    if (cursor) {
      query = query.gt('created_at', cursor);
    }

    const { data: messages, error } = await query;

    if (error) {
      logger.error({ err: error }, 'Failed to fetch chat history');
      throw new AppError({
        code: 'CHAT_HISTORY_FETCH_FAILED',
        message: 'Falha ao buscar historico de chat',
        statusCode: 500,
      });
    }

    return messages ?? [];
  },
};

export { extractOperations as _extractOperations };
