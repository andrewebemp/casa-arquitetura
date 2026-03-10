import { createClient } from '@/lib/supabase/client';
import type { InputType } from '@decorai/shared';

export interface CreateProjectParams {
  name: string;
  inputType: InputType;
  roomType: string;
  photo?: File;
}

export interface SpatialInputParams {
  projectId: string;
  width: number;
  length: number;
  ceilingHeight?: number;
  openings: Array<{
    type: 'door' | 'window' | 'archway';
    wall: 'north' | 'south' | 'east' | 'west';
    width_m: number;
    height_m: number;
  }>;
  description?: string;
}

export interface ReferenceItemParams {
  name: string;
  measurement?: string;
  photo?: File;
}

export interface CroquiResponse {
  croqui_ascii: string;
  turn_number: number;
}

export interface GenerationResponse {
  job_id: string;
  status: string;
}

export interface StyleItem {
  name: string;
  preview_url?: string;
}

export async function fetchStyles(): Promise<string[]> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL ?? ''}/api/staging/styles`,
    {
      headers: {
        'Authorization': `Bearer ${session?.access_token ?? ''}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Falha ao carregar estilos');
  }

  const data = await response.json();
  return data.styles ?? data;
}

export async function createProject(params: CreateProjectParams): Promise<string> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  const formData = new FormData();
  formData.append('name', params.name);
  formData.append('input_type', params.inputType);
  if (params.roomType) {
    formData.append('room_type', params.roomType);
  }
  if (params.photo) {
    formData.append('photo', params.photo);
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL ?? ''}/api/projects`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session?.access_token ?? ''}`,
      },
      body: formData,
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.error?.message ?? 'Falha ao criar projeto');
  }

  const json = await response.json();
  return json.data?.id ?? json.id;
}

export async function submitSpatialInput(params: SpatialInputParams): Promise<void> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL ?? ''}/api/projects/${params.projectId}/spatial-input`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session?.access_token ?? ''}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        dimensions: {
          width_m: params.width,
          length_m: params.length,
          height_m: params.ceilingHeight ?? 2.7,
        },
        openings: params.openings,
        description: params.description,
      }),
    }
  );

  if (!response.ok) {
    throw new Error('Falha ao enviar descricao espacial');
  }
}

export async function addReferenceItems(
  projectId: string,
  items: ReferenceItemParams[]
): Promise<void> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  for (const item of items) {
    const formData = new FormData();
    formData.append('name', item.name);
    if (item.measurement) {
      formData.append('measurement', item.measurement);
    }
    if (item.photo) {
      formData.append('photo', item.photo);
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL ?? ''}/api/projects/${projectId}/reference-items`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token ?? ''}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(`Falha ao adicionar item de referencia: ${item.name}`);
    }
  }
}

export async function generateCroqui(projectId: string): Promise<CroquiResponse> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL ?? ''}/api/projects/${projectId}/croqui/generate`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session?.access_token ?? ''}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error('Falha ao gerar croqui');
  }

  return response.json();
}

export async function iterateCroqui(
  projectId: string,
  feedback: string
): Promise<CroquiResponse> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL ?? ''}/api/projects/${projectId}/croqui/iterate`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session?.access_token ?? ''}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ feedback }),
    }
  );

  if (!response.ok) {
    throw new Error('Falha ao iterar croqui');
  }

  return response.json();
}

export async function approveCroqui(projectId: string): Promise<void> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL ?? ''}/api/projects/${projectId}/croqui/approve`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session?.access_token ?? ''}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error('Falha ao aprovar croqui');
  }
}

export async function startGeneration(
  projectId: string,
  style: string
): Promise<GenerationResponse> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL ?? ''}/api/projects/${projectId}/staging/generate`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session?.access_token ?? ''}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ style }),
    }
  );

  if (!response.ok) {
    throw new Error('Falha ao iniciar geracao');
  }

  return response.json();
}

export async function updateProjectStyle(
  projectId: string,
  style: string
): Promise<void> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL ?? ''}/api/projects/${projectId}`,
    {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${session?.access_token ?? ''}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ style }),
    }
  );

  if (!response.ok) {
    throw new Error('Falha ao atualizar estilo do projeto');
  }
}

export function subscribeToProgress(
  jobId: string,
  onProgress: (progress: number, stage: string) => void,
  onComplete: () => void,
  onError: (error: string) => void
): () => void {
  const supabase = createClient();

  const channel = supabase
    .channel(`render-job-${jobId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'render_jobs',
        filter: `id=eq.${jobId}`,
      },
      (payload) => {
        const job = payload.new as Record<string, unknown>;
        const status = job.status as string;
        const outputParams = job.output_params as Record<string, unknown> | null;

        if (status === 'completed') {
          onProgress(100, 'Concluido!');
          onComplete();
        } else if (status === 'failed') {
          onError((job.error_message as string) ?? 'Erro desconhecido na geracao');
        } else if (status === 'processing') {
          const progress = (outputParams?.progress as number) ?? 0;
          const stage = (outputParams?.stage as string) ?? 'Processando...';
          onProgress(progress, stage);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
