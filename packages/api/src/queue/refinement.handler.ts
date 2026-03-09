import { Job } from 'bullmq';
import { supabaseAdmin } from '../lib/supabase';
import { aiPipelineClient } from '../lib/ai-pipeline.client';
import { chatEvents } from './chat.events';
import { logger } from '../lib/logger';
import type { RenderJobData } from './render.queue';

/**
 * Handles refinement jobs dispatched by chat service.
 * Applies partial edits via AI pipeline, creates new project_version,
 * updates chat_message.version_id, and broadcasts "ready" event.
 */
export const processRefinementJob = async (job: Job<RenderJobData>): Promise<void> => {
  const { jobId, projectId, inputParams } = job.data;
  const chatMessageId = inputParams.chat_message_id as string;
  const operations = inputParams.operations as Array<{
    type: string;
    target: string;
    params: Record<string, unknown>;
  }>;

  // Update job status to processing
  await supabaseAdmin
    .from('render_jobs')
    .update({ status: 'processing', started_at: new Date().toISOString() })
    .eq('id', jobId);

  await chatEvents.broadcast({
    projectId,
    status: 'progress',
    chatMessageId,
    jobId,
    progress: 10,
  });

  // Get the latest version image as source
  const { data: latestVersion } = await supabaseAdmin
    .from('project_versions')
    .select('*')
    .eq('project_id', projectId)
    .order('version_number', { ascending: false })
    .limit(1)
    .single();

  const sourceImageUrl = latestVersion
    ? (latestVersion as { image_url: string }).image_url
    : '';

  await job.updateProgress(20);
  await chatEvents.broadcast({
    projectId,
    status: 'progress',
    chatMessageId,
    jobId,
    progress: 20,
  });

  // Run depth estimation on source
  const depthResult = await aiPipelineClient.analyzeDepth(sourceImageUrl);

  await job.updateProgress(40);
  await chatEvents.broadcast({
    projectId,
    status: 'progress',
    chatMessageId,
    jobId,
    progress: 40,
  });

  // Generate refined image with operations as style params
  const genResult = await aiPipelineClient.generate({
    sourceImageUrl,
    depthMapUrl: depthResult.depth_map_url,
    styleParams: {
      refinement: true,
      operations,
    },
    outputResolution: '1024x1024',
  });

  await job.updateProgress(80);
  await chatEvents.broadcast({
    projectId,
    status: 'progress',
    chatMessageId,
    jobId,
    progress: 80,
  });

  // Get next version number
  const { data: versionRows } = await supabaseAdmin
    .from('project_versions')
    .select('version_number')
    .eq('project_id', projectId)
    .order('version_number', { ascending: false })
    .limit(1);

  const versions = versionRows as Array<{ version_number: number }> | null;
  const nextVersion = (versions && versions.length > 0)
    ? versions[0].version_number + 1
    : 1;

  // Create new project_version
  const { data: newVersion, error: versionError } = await supabaseAdmin
    .from('project_versions')
    .insert({
      project_id: projectId,
      version_number: nextVersion,
      image_url: genResult.result_image_url,
      thumbnail_url: genResult.result_image_url,
      prompt: 'refinement',
      refinement_command: JSON.stringify(operations),
      metadata: {
        type: 'refinement',
        chat_message_id: chatMessageId,
        operations,
        depth_map_url: depthResult.depth_map_url,
        provider: genResult.metadata.provider,
        inference_time_ms: genResult.metadata.inference_time_ms,
      },
    })
    .select()
    .single();

  if (versionError || !newVersion) {
    logger.error({ err: versionError }, 'Failed to create refinement version');
    throw new Error('Failed to create project version for refinement');
  }

  const versionId = (newVersion as { id: string }).id;

  // Update chat_message with version_id
  await supabaseAdmin
    .from('chat_messages')
    .update({ version_id: versionId })
    .eq('id', chatMessageId);

  // Update render job as completed
  await supabaseAdmin
    .from('render_jobs')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      version_id: versionId,
      output_params: {
        result_image_url: genResult.result_image_url,
        depth_map_url: depthResult.depth_map_url,
        metadata: genResult.metadata,
      },
      gpu_provider: genResult.metadata.provider,
      duration_ms: genResult.metadata.inference_time_ms,
    })
    .eq('id', jobId);

  await job.updateProgress(100);

  // Broadcast "ready" event
  await chatEvents.broadcast({
    projectId,
    status: 'ready',
    chatMessageId,
    jobId,
    versionId,
    progress: 100,
  });
};
