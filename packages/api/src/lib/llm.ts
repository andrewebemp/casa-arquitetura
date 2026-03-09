import { logger } from './logger';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';
const DEFAULT_MODEL = 'google/gemini-3-flash-preview';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface LlmResponse {
  text: string;
  model: string;
  usage: { prompt_tokens: number; completion_tokens: number };
}

async function chatCompletion(params: {
  model?: string;
  system: string;
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  maxTokens?: number;
}): Promise<LlmResponse> {
  const model = params.model ?? DEFAULT_MODEL;

  const body: ChatMessage[] = [
    { role: 'system', content: params.system },
    ...params.messages,
  ];

  const response = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'HTTP-Referer': 'https://decorai.com.br',
      'X-Title': 'DecorAI Brasil',
    },
    body: JSON.stringify({
      model,
      messages: body,
      max_tokens: params.maxTokens ?? 1024,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    logger.error({ status: response.status, body: errorBody }, 'OpenRouter API error');
    throw new Error(`OpenRouter API error (${response.status}): ${errorBody}`);
  }

  const data = await response.json() as {
    choices: Array<{ message: { content: string } }>;
    model: string;
    usage: { prompt_tokens: number; completion_tokens: number };
  };

  const text = data.choices?.[0]?.message?.content ?? '';
  if (!text) {
    throw new Error('OpenRouter returned empty response');
  }

  return {
    text,
    model: data.model ?? model,
    usage: data.usage ?? { prompt_tokens: 0, completion_tokens: 0 },
  };
}

export { chatCompletion, DEFAULT_MODEL };
