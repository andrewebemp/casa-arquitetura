import { supabaseAdmin } from '../lib/supabase';
import { logger } from '../lib/logger';

interface ChatEvent {
  projectId: string;
  status: 'refining' | 'progress' | 'ready' | 'error';
  chatMessageId?: string;
  jobId?: string;
  progress?: number;
  versionId?: string;
  error_message?: string;
}

export const chatEvents = {
  async broadcast(event: ChatEvent): Promise<void> {
    const channel = `project:${event.projectId}`;

    try {
      await supabaseAdmin.channel(channel).send({
        type: 'broadcast',
        event: 'chat_status',
        payload: {
          project_id: event.projectId,
          status: event.status,
          chat_message_id: event.chatMessageId ?? null,
          job_id: event.jobId ?? null,
          progress: event.progress ?? null,
          version_id: event.versionId ?? null,
          error_message: event.error_message ?? null,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (err) {
      logger.error({ err, channel, event }, 'Failed to broadcast chat event');
    }
  },
};
