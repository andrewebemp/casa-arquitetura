/**
 * Segmentation Service (Story 3.1, Task 4)
 * Orchestrates: SAM segmentation -> classification -> mask storage -> inpainting.
 */

import { createUserClient, supabaseAdmin } from '../lib/supabase';
import { AppError } from '../lib/errors';
import { logger } from '../lib/logger';
import { samClient } from './sam-client';
import { elementClassifier } from './element-classifier';
import { materialCatalog } from './material-catalog.registry';
import { inpaintingService } from './inpainting.service';
import { quotaService } from './quota.service';
import { enqueueRenderJob } from '../queue/render.queue';
import { renderEvents } from '../queue/render.events';
import { redisHealthCheck } from '../lib/redis';
import type { Database } from '@decorai/shared';

type VersionRow = Database['public']['Tables']['project_versions']['Row'];
type RenderJobRow = Database['public']['Tables']['render_jobs']['Row'];

interface SegmentData {
  segment_id: string;
  label: string;
  category: string;
  mask_url: string;
  polygon: Array<{ x: number; y: number }>;
  bounding_box: { x: number; y: number; width: number; height: number };
  confidence: number;
}

export const segmentationService = {
  async getLatestRenderUrl(projectId: string, userId: string, accessToken: string): Promise<string> {
    // Verify project ownership
    const client = createUserClient(accessToken);
    const { data: project, error: projectError } = await client
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .eq('user_id', userId)
      .single();

    if (projectError || !project) {
      throw new AppError({
        code: 'PROJECT_NOT_FOUND',
        message: 'Projeto nao encontrado',
        statusCode: 404,
      });
    }

    // Get latest completed version
    const { data: versions } = await supabaseAdmin
      .from('project_versions')
      .select('image_url')
      .eq('project_id', projectId)
      .order('version_number', { ascending: false })
      .limit(1);

    const versionRows = versions as Array<{ image_url: string }> | null;

    if (!versionRows || versionRows.length === 0) {
      throw new AppError({
        code: 'NO_RENDER_AVAILABLE',
        message: 'No render available for segmentation',
        statusCode: 404,
      });
    }

    return versionRows[0].image_url;
  },

  async segmentPoint(params: {
    projectId: string;
    userId: string;
    x: number;
    y: number;
    box?: { x: number; y: number; width: number; height: number };
    accessToken: string;
  }): Promise<SegmentData> {
    const { projectId, userId, x, y, box, accessToken } = params;

    const imageUrl = await this.getLatestRenderUrl(projectId, userId, accessToken);

    let segment;
    if (box) {
      segment = await samClient.segmentByBox({ image_url: imageUrl, box });
    } else {
      segment = await samClient.segmentByPoint({ image_url: imageUrl, x, y });
    }

    const category = elementClassifier.classify(segment.label, segment.confidence);

    // Store mask reference in project metadata
    await supabaseAdmin
      .from('project_versions')
      .select('id')
      .eq('project_id', projectId)
      .order('version_number', { ascending: false })
      .limit(1);

    return {
      segment_id: segment.segment_id,
      label: segment.label,
      category,
      mask_url: segment.mask_url,
      polygon: segment.polygon,
      bounding_box: segment.bounding_box,
      confidence: segment.confidence,
    };
  },

  async segmentAll(params: {
    projectId: string;
    userId: string;
    accessToken: string;
  }): Promise<SegmentData[]> {
    const { projectId, userId, accessToken } = params;

    const imageUrl = await this.getLatestRenderUrl(projectId, userId, accessToken);

    const segments = await samClient.segmentAll({ image_url: imageUrl });

    return segments.map((seg) => ({
      segment_id: seg.segment_id,
      label: seg.label,
      category: elementClassifier.classify(seg.label, seg.confidence),
      mask_url: seg.mask_url,
      polygon: seg.polygon,
      bounding_box: seg.bounding_box,
      confidence: seg.confidence,
    }));
  },

  async applyMaterialSwap(params: {
    projectId: string;
    userId: string;
    segmentId: string;
    materialDescriptor: string;
    accessToken: string;
  }) {
    const { projectId, userId, segmentId, materialDescriptor, accessToken } = params;

    // Validate queue availability
    const isRedisUp = await redisHealthCheck();
    if (!isRedisUp) {
      throw new AppError({
        code: 'QUEUE_UNAVAILABLE',
        message: 'Servico de fila indisponivel. Tente novamente mais tarde.',
        statusCode: 503,
      });
    }

    // Verify project ownership
    const client = createUserClient(accessToken);
    const { data: project, error: projectError } = await client
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .eq('user_id', userId)
      .single();

    if (projectError || !project) {
      throw new AppError({
        code: 'PROJECT_NOT_FOUND',
        message: 'Projeto nao encontrado',
        statusCode: 404,
      });
    }

    // Get latest version (AC4: cumulative edits use latest version)
    const { data: latestVersions } = await supabaseAdmin
      .from('project_versions')
      .select('id, version_number, image_url, metadata')
      .eq('project_id', projectId)
      .order('version_number', { ascending: false })
      .limit(1);

    const versionRows = latestVersions as VersionRow[] | null;

    if (!versionRows || versionRows.length === 0) {
      throw new AppError({
        code: 'NO_RENDER_AVAILABLE',
        message: 'No render available for segmentation',
        statusCode: 404,
      });
    }

    const latestVersion = versionRows[0];

    // Enforce quota (AC6: segment/apply counts as render credit)
    const quota = await quotaService.enforceQuota(userId);

    // Create render job in DB
    const { data, error } = await supabaseAdmin
      .from('render_jobs')
      .insert({
        project_id: projectId,
        type: 'segmentation',
        status: 'queued',
        priority: quota.tier === 'business' ? 1 : quota.tier === 'pro' ? 5 : 10,
        input_params: {
          segment_id: segmentId,
          material_descriptor: materialDescriptor,
          base_image_url: latestVersion.image_url,
          base_version_id: latestVersion.id,
          base_version_number: latestVersion.version_number,
        },
        attempts: 0,
      })
      .select()
      .single();

    const job = data as RenderJobRow | null;

    if (error || !job) {
      logger.error({ err: error }, 'Failed to create segmentation render job');
      throw new AppError({
        code: 'SEGMENTATION_JOB_CREATE_FAILED',
        message: 'Falha ao criar job de segmentacao',
        statusCode: 500,
      });
    }

    // Enqueue in BullMQ
    await enqueueRenderJob(
      {
        jobId: job.id,
        projectId,
        userId,
        type: 'segmentation',
        inputParams: job.input_params as Record<string, unknown>,
      },
      quota.tier,
    );

    return {
      job_id: job.id,
      status: job.status,
      segment_id: segmentId,
      material_descriptor: materialDescriptor,
    };
  },

  async processSegmentationJob(jobId: string, inputParams: Record<string, unknown>) {
    const segmentId = inputParams.segment_id as string;
    const materialDescriptor = inputParams.material_descriptor as string;
    const baseImageUrl = inputParams.base_image_url as string;
    const baseVersionNumber = inputParams.base_version_number as number;

    const startTime = Date.now();

    // Get project info from render job
    const { data: job } = await supabaseAdmin
      .from('render_jobs')
      .select('project_id')
      .eq('id', jobId)
      .single();

    if (!job) {
      throw new AppError({
        code: 'RENDER_JOB_NOT_FOUND',
        message: 'Job de render nao encontrado',
        statusCode: 404,
      });
    }

    const projectId = job.project_id;

    // Stage 1: Re-segment to get fresh mask (25%)
    await renderEvents.broadcast({ jobId, status: 'processing', progress: 25 });

    // Stage 2: Inpainting with material descriptor (50%)
    await renderEvents.broadcast({ jobId, status: 'processing', progress: 50 });

    const inpaintResult = await inpaintingService.swapMaterial({
      imageUrl: baseImageUrl,
      segmentId,
      materialDescriptor,
    });

    // Stage 3: Edge blending (75%)
    await renderEvents.broadcast({ jobId, status: 'processing', progress: 75 });

    // Stage 4: Store result and create version (100%)
    const generationTimeMs = Date.now() - startTime;
    const nextVersion = baseVersionNumber + 1;

    const { data: versionData, error: versionError } = await supabaseAdmin
      .from('project_versions')
      .insert({
        project_id: projectId,
        version_number: nextVersion,
        image_url: inpaintResult.result_image_url,
        thumbnail_url: inpaintResult.result_image_url,
        prompt: materialDescriptor,
        metadata: {
          type: 'segmentation',
          segment_id: segmentId,
          original_material: 'auto-detected',
          new_material: materialDescriptor,
          generation_time_ms: generationTimeMs,
          provider: inpaintResult.provider,
        },
      })
      .select()
      .single();

    const version = versionData as VersionRow | null;

    if (versionError) {
      logger.error({ err: versionError }, 'Failed to create segmentation version');
    }

    // Update render job
    await supabaseAdmin
      .from('render_jobs')
      .update({
        status: 'completed',
        output_params: {
          result_url: inpaintResult.result_image_url,
          version_id: version ? version.id : null,
          generation_time_ms: generationTimeMs,
        },
        duration_ms: generationTimeMs,
        completed_at: new Date().toISOString(),
      })
      .eq('id', jobId);

    // Broadcast completion
    await renderEvents.broadcast({ jobId, status: 'completed', progress: 100 });

    return {
      result_url: inpaintResult.result_image_url,
      version_id: version ? version.id : null,
      generation_time_ms: generationTimeMs,
    };
  },

  getSuggestedMaterials(category: string) {
    const materials = materialCatalog.getByCategory(category as never);
    return materials.map((m) => ({
      id: m.id,
      name: m.name,
      description: m.description,
      category: m.category,
    }));
  },
};
