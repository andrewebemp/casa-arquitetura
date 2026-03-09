import { createClient } from '@/lib/supabase/client';
import type { ChatMessage, ProjectVersion } from '@decorai/shared';

export interface ChatHistoryResponse {
  messages: ChatMessage[];
  next_cursor: string | null;
  has_more: boolean;
}

export interface VersionListResponse {
  versions: ProjectVersion[];
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  return {
    'Authorization': `Bearer ${session?.access_token ?? ''}`,
    'Content-Type': 'application/json',
  };
}

export async function getChatHistory(
  projectId: string,
  cursor?: string
): Promise<ChatHistoryResponse> {
  const headers = await getAuthHeaders();
  const params = new URLSearchParams();
  if (cursor) {
    params.set('cursor', cursor);
  }

  const url = `${process.env.NEXT_PUBLIC_API_URL ?? ''}/api/projects/${projectId}/chat/history?${params.toString()}`;
  const response = await fetch(url, { headers });

  if (!response.ok) {
    throw new Error('Falha ao carregar historico do chat');
  }

  return response.json();
}

export async function sendMessage(
  projectId: string,
  message: string
): Promise<ChatMessage> {
  const headers = await getAuthHeaders();

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL ?? ''}/api/projects/${projectId}/chat`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify({ message }),
    }
  );

  if (!response.ok) {
    throw new Error('Falha ao enviar mensagem');
  }

  return response.json();
}

export async function getVersions(
  projectId: string
): Promise<ProjectVersion[]> {
  const headers = await getAuthHeaders();

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL ?? ''}/api/projects/${projectId}/versions`,
    { headers }
  );

  if (!response.ok) {
    throw new Error('Falha ao carregar versoes');
  }

  const data = await response.json();
  return data.versions ?? data;
}

export async function getVersion(
  projectId: string,
  versionId: string
): Promise<ProjectVersion> {
  const headers = await getAuthHeaders();

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL ?? ''}/api/projects/${projectId}/versions/${versionId}`,
    { headers }
  );

  if (!response.ok) {
    throw new Error('Falha ao carregar versao');
  }

  return response.json();
}

export async function revertVersion(
  projectId: string,
  versionId: string
): Promise<ProjectVersion> {
  const headers = await getAuthHeaders();

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL ?? ''}/api/projects/${projectId}/versions/${versionId}/revert`,
    {
      method: 'POST',
      headers,
    }
  );

  if (!response.ok) {
    throw new Error('Falha ao restaurar versao');
  }

  return response.json();
}

export interface RefinementProgressEvent {
  status: 'processing' | 'completed' | 'failed';
  progress: number;
  stage: string;
  error_message?: string;
}

export function subscribeToRefinementProgress(
  projectId: string,
  onEvent: (event: RefinementProgressEvent) => void
): () => void {
  const supabase = createClient();

  const channel = supabase
    .channel(`project:${projectId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'render_jobs',
        filter: `project_id=eq.${projectId}`,
      },
      (payload) => {
        const job = payload.new as Record<string, unknown>;
        const status = job.status as string;
        const outputParams = job.output_params as Record<string, unknown> | null;

        if (status === 'completed') {
          onEvent({ status: 'completed', progress: 100, stage: 'Concluido!' });
        } else if (status === 'failed') {
          onEvent({
            status: 'failed',
            progress: 0,
            stage: '',
            error_message: (job.error_message as string) ?? 'Erro desconhecido',
          });
        } else if (status === 'processing') {
          onEvent({
            status: 'processing',
            progress: (outputParams?.progress as number) ?? 0,
            stage: (outputParams?.stage as string) ?? 'Processando...',
          });
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
