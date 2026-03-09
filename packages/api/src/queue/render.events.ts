import { supabaseAdmin } from '../lib/supabase';
import { logger } from '../lib/logger';
import type { RenderJobStatus } from '@decorai/shared';

interface RenderEvent {
  jobId: string;
  status: RenderJobStatus;
  progress?: number;
  error_message?: string;
}

export const renderEvents = {
  async broadcast(event: RenderEvent): Promise<void> {
    const channel = `render:${event.jobId}`;

    try {
      await supabaseAdmin.channel(channel).send({
        type: 'broadcast',
        event: 'status_change',
        payload: {
          job_id: event.jobId,
          status: event.status,
          progress: event.progress ?? null,
          error_message: event.error_message ?? null,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (err) {
      logger.error({ err, channel, event }, 'Failed to broadcast render event');
    }
  },
};
