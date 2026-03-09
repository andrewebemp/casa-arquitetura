import type { DiagnosticResponse } from '@decorai/shared';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? '';

export async function createDiagnostic(params?: {
  property_type?: string;
  location?: string;
}): Promise<{ id: string; session_token: string | null }> {
  const response = await fetch(`${API_BASE}/api/diagnostics`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(params ?? {}),
  });

  if (!response.ok) {
    throw new Error('Falha ao criar diagnostico');
  }

  const json = await response.json();
  return json.data;
}

export async function uploadDiagnosticPhoto(
  id: string,
  photo: File,
): Promise<{ image_url: string }> {
  const formData = new FormData();
  formData.append('file', photo);

  const response = await fetch(`${API_BASE}/api/diagnostics/${id}/upload`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  if (!response.ok) {
    const json = await response.json().catch(() => null);
    const message = json?.error?.message ?? 'Falha no upload da imagem';
    throw new Error(message);
  }

  const json = await response.json();
  return json.data;
}

export async function getDiagnosticResult(
  id: string,
): Promise<DiagnosticResponse> {
  const response = await fetch(`${API_BASE}/api/diagnostics/${id}`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Falha ao obter resultado do diagnostico');
  }

  const json = await response.json();
  return json.data;
}
