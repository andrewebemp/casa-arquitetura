export type ChatRole = 'user' | 'assistant' | 'system';

export interface RefinementOperation {
  type: 'add' | 'remove' | 'change' | 'move' | 'resize';
  target: string;
  params: Record<string, unknown>;
}

export interface ChatMessage {
  id: string;
  project_id: string;
  role: ChatRole;
  content: string;
  operations: RefinementOperation[] | null;
  version_id: string | null;
  created_at: string;
}
