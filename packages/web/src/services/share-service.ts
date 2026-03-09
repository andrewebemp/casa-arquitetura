import { createClient } from '@/lib/supabase/client';
import type { ShareLink } from '@decorai/shared';

export interface SliderData {
  original_url: string;
  rendered_url: string;
  version_id: string;
  project_name: string;
  style: string;
  created_at: string;
}

export interface PublicShareData {
  original_url: string;
  rendered_url: string;
  project_name: string;
  style: string;
  created_at: string;
  include_watermark: boolean;
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  return {
    'Authorization': `Bearer ${session?.access_token ?? ''}`,
    'Content-Type': 'application/json',
  };
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? '';

export async function getSliderData(
  projectId: string,
  versionId?: string
): Promise<SliderData> {
  const headers = await getAuthHeaders();
  const params = new URLSearchParams();
  if (versionId) {
    params.set('version_id', versionId);
  }

  const url = `${API_BASE}/api/projects/${projectId}/slider-data?${params.toString()}`;
  const response = await fetch(url, { headers });

  if (!response.ok) {
    throw new Error('Falha ao carregar dados do slider');
  }

  const json = await response.json();
  return json.data ?? json;
}

export async function createShareLink(
  projectId: string,
  options?: { version_id?: string; expires_in_days?: number }
): Promise<ShareLink> {
  const headers = await getAuthHeaders();

  const response = await fetch(
    `${API_BASE}/api/projects/${projectId}/share`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify(options ?? {}),
    }
  );

  if (!response.ok) {
    throw new Error('Falha ao criar link de compartilhamento');
  }

  const json = await response.json();
  return json.data ?? json;
}

export async function getShareLinks(
  projectId: string
): Promise<ShareLink[]> {
  const headers = await getAuthHeaders();

  const response = await fetch(
    `${API_BASE}/api/projects/${projectId}/shares`,
    { headers }
  );

  if (!response.ok) {
    throw new Error('Falha ao carregar links de compartilhamento');
  }

  const json = await response.json();
  return json.data ?? json;
}

export async function deleteShareLink(
  projectId: string,
  shareId: string
): Promise<void> {
  const headers = await getAuthHeaders();

  const response = await fetch(
    `${API_BASE}/api/projects/${projectId}/shares/${shareId}`,
    {
      method: 'DELETE',
      headers,
    }
  );

  if (!response.ok) {
    throw new Error('Falha ao excluir link de compartilhamento');
  }
}

export async function getPublicShareData(
  shareToken: string
): Promise<PublicShareData> {
  const response = await fetch(
    `${API_BASE}/api/share/${shareToken}`,
    { headers: { 'Content-Type': 'application/json' } }
  );

  if (response.status === 410) {
    throw new ShareExpiredError();
  }

  if (response.status === 404) {
    throw new ShareNotFoundError();
  }

  if (!response.ok) {
    throw new Error('Falha ao carregar dados do compartilhamento');
  }

  const json = await response.json();
  return json.data ?? json;
}

export class ShareExpiredError extends Error {
  constructor() {
    super('Link expirado');
    this.name = 'ShareExpiredError';
  }
}

export class ShareNotFoundError extends Error {
  constructor() {
    super('Link nao encontrado');
    this.name = 'ShareNotFoundError';
  }
}
