import { createClient } from '@/lib/supabase/client';
import type { Project } from '@decorai/shared';

export interface ProjectListParams {
  style?: string;
  sort?: 'recent' | 'oldest';
  favorites?: boolean;
}

export interface ProjectListResponse {
  projects: Project[];
  total: number;
}

export async function fetchProjects(params: ProjectListParams = {}): Promise<ProjectListResponse> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Usuario nao autenticado');
  }

  let query = supabase
    .from('projects')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id);

  if (params.style) {
    query = query.eq('style', params.style);
  }

  if (params.favorites) {
    query = query.eq('is_favorite', true);
  }

  const orderAsc = params.sort === 'oldest';
  query = query.order('updated_at', { ascending: orderAsc });

  const { data, error, count } = await query;

  if (error) {
    throw new Error(`Falha ao carregar projetos: ${error.message}`);
  }

  return { projects: data as Project[], total: count ?? 0 };
}

export async function deleteProject(projectId: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId);

  if (error) {
    throw new Error(`Falha ao excluir projeto: ${error.message}`);
  }
}

export async function duplicateProject(projectId: string): Promise<Project> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Usuario nao autenticado');
  }

  const { data: original, error: fetchError } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single();

  if (fetchError || !original) {
    throw new Error(`Falha ao buscar projeto original: ${fetchError?.message}`);
  }

  const { data: duplicate, error: insertError } = await supabase
    .from('projects')
    .insert({
      user_id: user.id,
      name: `${original.name} (copia)`,
      input_type: original.input_type,
      style: original.style,
      status: 'draft',
      room_type: original.room_type,
      original_image_url: original.original_image_url,
    })
    .select()
    .single();

  if (insertError || !duplicate) {
    throw new Error(`Falha ao duplicar projeto: ${insertError?.message}`);
  }

  return duplicate as Project;
}

export async function toggleFavorite(projectId: string, isFavorite: boolean): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from('projects')
    .update({ is_favorite: isFavorite })
    .eq('id', projectId);

  if (error) {
    throw new Error(`Falha ao atualizar favorito: ${error.message}`);
  }
}

export async function fetchSubscription() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Usuario nao autenticado');
  }

  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error) {
    throw new Error(`Falha ao carregar assinatura: ${error.message}`);
  }

  return data;
}
