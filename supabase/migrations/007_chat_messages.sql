-- ============================================================
-- DecorAI Brasil — Migration 007: Chat Messages
-- Ref: FR-04, FR-05, FR-06, FR-27, FR-28
-- ============================================================

CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  operations JSONB,
  version_id UUID REFERENCES project_versions(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_chat_project_id ON chat_messages(project_id);
CREATE INDEX idx_chat_created_at ON chat_messages(project_id, created_at);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own chat" ON chat_messages
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = chat_messages.project_id AND projects.user_id = auth.uid())
  );
CREATE POLICY "Users insert own chat" ON chat_messages
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = chat_messages.project_id AND projects.user_id = auth.uid())
  );
