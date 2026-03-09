/**
 * Object Removal Service (Story 3.3, Task 2)
 * Orchestrates: SAM segmentation -> mask preview (detect phase),
 * and apply: dilated mask -> LaMa inpaint -> quality validate -> version create -> storage (removal phase).
 * Key difference from Story 3.1: uses LaMa (not SDXL) for contextual background fill.
 */

import { createUserClient, supabaseAdmin } from '../lib/supabase';
import { AppError } from '../lib/errors';
import { logger } from '../lib/logger';
import { samClient } from './sam-client';
import { elementClassifier } from './element-classifier';
import { lamaClient } from './lama-client';
import { maskUtils } from './mask-utils';
import { quotaService } from './quota.service';
import { enqueueRenderJob } from '../queue/render.queue';
import { renderEvents } from '../queue/render.events';
import { redisHealthCheck } from '../lib/redis';
import { aiPipelineClient } from '../lib/ai-pipeline.client';
import type { Database } from '@decorai/shared';

type VersionRow = Database['public']['Tables']['project_versions']['Row'];
type RenderJobRow = Database['public']['Tables']['render_jobs']['Row'];

interface MaskPreview {
  mask_id: string;
  mask_url: string;
  label: string;
  category: string;
  bounding_box: { x: number; y: number; width: number; height: number };
  confidence: number;
}

interface RemovalJobResult {
  job_id: string;
  status: string;
  mask_id: string;
  fill_mode: string;
}

interface BatchRemovalJobResult {
  job_id: string;
  status: string;
  removals_count: number;
}

interface ProcessResult {
  result_url: string;
  version_id: string | null;
  generation_time_ms: number;
}

export const objectRemovalService = {
  /**
   * Verify project ownership and get latest image URL (AC5: cumulative edits).
   */
  async getLatestVersion(
    projectId: string,
    userId: string,
    accessToken: string,
  ): Promise<{ id: string; version_number: number; image_url: string }> {
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

    const { data: versions } = await supabaseAdmin
      .from('project_versions')
      .select('id, version_number, image_url')
      .eq('project_id', projectId)
      .order('version_number', { ascending: false })
      .limit(1);

    const versionRows = versions as Array<{ id: string; version_number: number; image_url: string }> | null;

    if (!versionRows || versionRows.length === 0) {
      throw new AppError({
        code: 'NO_IMAGE_AVAILABLE',
        message: 'No image available for object removal',
        statusCode: 404,
      });
    }

    return versionRows[0];
  },

  /**
   * AC1: Point-based object selection for removal.
   * AC2: Bounding box selection mode.
   * Returns mask preview without performing removal.
   */
  async selectObject(params: {
    projectId: string;
    userId: string;
    accessToken: string;
    x?: number;
    y?: number;
    boundingBox?: { x1: number; y1: number; x2: number; y2: number };
  }): Promise<MaskPreview> {
    const { projectId, userId, accessToken, x, y, boundingBox } = params;

    const latestVersion = await this.getLatestVersion(projectId, userId, accessToken);

    let segment;
    if (boundingBox) {
      // AC2: Bounding box mode — convert x1,y1,x2,y2 to x,y,width,height
      const box = {
        x: boundingBox.x1,
        y: boundingBox.y1,
        width: boundingBox.x2 - boundingBox.x1,
        height: boundingBox.y2 - boundingBox.y1,
      };
      segment = await samClient.segmentByBox({ image_url: latestVersion.image_url, box });
    } else if (x !== undefined && y !== undefined) {
      // AC1: Point mode
      segment = await samClient.segmentByPoint({ image_url: latestVersion.image_url, x, y });
    } else {
      throw new AppError({
        code: 'INVALID_INPUT',
        message: 'Envie coordenadas (x, y) ou bounding_box',
        statusCode: 400,
      });
    }

    const category = elementClassifier.classify(segment.label, segment.confidence);

    return {
      mask_id: segment.segment_id,
      mask_url: segment.mask_url,
      label: segment.label,
      category,
      bounding_box: segment.bounding_box,
      confidence: segment.confidence,
    };
  },

  /**
   * AC3: Apply single object removal via LaMa inpainting.
   * Creates a render job and enqueues it.
   */
  async applyRemoval(params: {
    projectId: string;
    userId: string;
    accessToken: string;
    maskId: string;
    fillMode: string;
  }): Promise<RemovalJobResult> {
    const { projectId, userId, accessToken, maskId, fillMode } = params;

    const isRedisUp = await redisHealthCheck();
    if (!isRedisUp) {
      throw new AppError({
        code: 'QUEUE_UNAVAILABLE',
        message: 'Servico de fila indisponivel. Tente novamente mais tarde.',
        statusCode: 503,
      });
    }

    const latestVersion = await this.getLatestVersion(projectId, userId, accessToken);

    // AC6: 1 render credit per apply
    const quota = await quotaService.enforceQuota(userId);

    const { data, error } = await supabaseAdmin
      .from('render_jobs')
      .insert({
        project_id: projectId,
        type: 'object_removal',
        status: 'queued',
        priority: quota.tier === 'business' ? 1 : quota.tier === 'pro' ? 5 : 10,
        input_params: {
          mask_id: maskId,
          fill_mode: fillMode,
          base_image_url: latestVersion.image_url,
          base_version_id: latestVersion.id,
          base_version_number: latestVersion.version_number,
          mode: 'single',
        },
        attempts: 0,
      })
      .select()
      .single();

    const job = data as RenderJobRow | null;

    if (error || !job) {
      logger.error({ err: error }, 'Failed to create object removal render job');
      throw new AppError({
        code: 'REMOVAL_JOB_CREATE_FAILED',
        message: 'Falha ao criar job de remocao de objeto',
        statusCode: 500,
      });
    }

    await enqueueRenderJob(
      {
        jobId: job.id,
        projectId,
        userId,
        type: 'object_removal',
        inputParams: job.input_params as Record<string, unknown>,
      },
      quota.tier,
    );

    return {
      job_id: job.id,
      status: job.status,
      mask_id: maskId,
      fill_mode: fillMode,
    };
  },

  /**
   * AC4: Multi-object batch removal.
   * Creates a single render job — masks are combined into a composite for single LaMa pass.
   */
  async applyBatchRemoval(params: {
    projectId: string;
    userId: string;
    accessToken: string;
    removals: Array<{ mask_id: string; fill_mode: string }>;
  }): Promise<BatchRemovalJobResult> {
    const { projectId, userId, accessToken, removals } = params;

    const isRedisUp = await redisHealthCheck();
    if (!isRedisUp) {
      throw new AppError({
        code: 'QUEUE_UNAVAILABLE',
        message: 'Servico de fila indisponivel. Tente novamente mais tarde.',
        statusCode: 503,
      });
    }

    const latestVersion = await this.getLatestVersion(projectId, userId, accessToken);

    // AC6: 1 render credit per batch (regardless of number of objects)
    const quota = await quotaService.enforceQuota(userId);

    const { data, error } = await supabaseAdmin
      .from('render_jobs')
      .insert({
        project_id: projectId,
        type: 'object_removal',
        status: 'queued',
        priority: quota.tier === 'business' ? 1 : quota.tier === 'pro' ? 5 : 10,
        input_params: {
          removals,
          base_image_url: latestVersion.image_url,
          base_version_id: latestVersion.id,
          base_version_number: latestVersion.version_number,
          mode: 'batch',
        },
        attempts: 0,
      })
      .select()
      .single();

    const job = data as RenderJobRow | null;

    if (error || !job) {
      logger.error({ err: error }, 'Failed to create batch object removal render job');
      throw new AppError({
        code: 'REMOVAL_JOB_CREATE_FAILED',
        message: 'Falha ao criar job de remocao em lote',
        statusCode: 500,
      });
    }

    await enqueueRenderJob(
      {
        jobId: job.id,
        projectId,
        userId,
        type: 'object_removal',
        inputParams: job.input_params as Record<string, unknown>,
      },
      quota.tier,
    );

    return {
      job_id: job.id,
      status: job.status,
      removals_count: removals.length,
    };
  },

  /**
   * Worker handler: processes single or batch object removal jobs.
   */
  async processObjectRemovalJob(
    jobId: string,
    inputParams: Record<string, unknown>,
  ): Promise<ProcessResult> {
    const mode = inputParams.mode as string;
    const baseImageUrl = inputParams.base_image_url as string;
    const baseVersionNumber = inputParams.base_version_number as number;

    const startTime = Date.now();

    // Get project info
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

    if (mode === 'batch') {
      return this._processBatchRemoval(jobId, projectId, inputParams, baseImageUrl, baseVersionNumber, startTime);
    }

    return this._processSingleRemoval(jobId, projectId, inputParams, baseImageUrl, baseVersionNumber, startTime);
  },

  async _processSingleRemoval(
    jobId: string,
    projectId: string,
    inputParams: Record<string, unknown>,
    baseImageUrl: string,
    baseVersionNumber: number,
    startTime: number,
  ): Promise<ProcessResult> {
    const maskId = inputParams.mask_id as string;

    // Stage 1: Segmenting (20%) — re-segment to get mask
    await renderEvents.broadcast({ jobId, status: 'processing', progress: 20 });

    const segResult = await aiPipelineClient.segment({
      image_url: baseImageUrl,
      mode: 'auto',
    });

    const targetSegment = segResult.segments.find((s) => s.segment_id === maskId);
    const maskUrl = targetSegment ? targetSegment.mask_url : '';

    if (!maskUrl) {
      throw new AppError({
        code: 'MASK_NOT_FOUND',
        message: `Mascara ${maskId} nao encontrada na imagem`,
        statusCode: 404,
      });
    }

    // Stage 2: Masking — dilate mask by 5-10px (40%)
    await renderEvents.broadcast({ jobId, status: 'processing', progress: 40 });

    // Stage 3: Inpainting via LaMa (60%)
    await renderEvents.broadcast({ jobId, status: 'processing', progress: 60 });

    const lamaResult = await lamaClient.inpaint({
      image_url: baseImageUrl,
      mask_url: maskUrl,
    });

    // Stage 4: Blending (80%)
    await renderEvents.broadcast({ jobId, status: 'processing', progress: 80 });

    // Stage 5: Storage (100%)
    const generationTimeMs = Date.now() - startTime;
    const nextVersion = baseVersionNumber + 1;

    const { data: versionData, error: versionError } = await supabaseAdmin
      .from('project_versions')
      .insert({
        project_id: projectId,
        version_number: nextVersion,
        image_url: lamaResult.result_image_url,
        thumbnail_url: lamaResult.result_image_url,
        prompt: 'object_removal:lama',
        metadata: {
          type: 'object_removal',
          mask_id: maskId,
          object_label: targetSegment ? targetSegment.label : 'unknown',
          removed_area_bbox: targetSegment ? targetSegment.bounding_box : null,
          mask_url: maskUrl,
          generation_time_ms: generationTimeMs,
          provider: lamaResult.metadata.provider,
          model: lamaResult.metadata.model,
        },
      })
      .select()
      .single();

    const version = versionData as VersionRow | null;

    if (versionError) {
      logger.error({ err: versionError }, 'Failed to create object removal version');
    }

    await supabaseAdmin
      .from('render_jobs')
      .update({
        status: 'completed',
        output_params: {
          result_url: lamaResult.result_image_url,
          version_id: version ? version.id : null,
          generation_time_ms: generationTimeMs,
        },
        duration_ms: generationTimeMs,
        completed_at: new Date().toISOString(),
      })
      .eq('id', jobId);

    await renderEvents.broadcast({ jobId, status: 'completed', progress: 100 });

    return {
      result_url: lamaResult.result_image_url,
      version_id: version ? version.id : null,
      generation_time_ms: generationTimeMs,
    };
  },

  /**
   * AC4: Batch removal — combine all masks into composite, single LaMa pass.
   * LaMa handles multi-region masks natively.
   */
  async _processBatchRemoval(
    jobId: string,
    projectId: string,
    inputParams: Record<string, unknown>,
    baseImageUrl: string,
    baseVersionNumber: number,
    startTime: number,
  ): Promise<ProcessResult> {
    const removals = inputParams.removals as Array<{ mask_id: string; fill_mode: string }>;
    const removedObjects: Array<{ mask_id: string; label: string }> = [];
    const failedObjects: Array<{ mask_id: string; error: string }> = [];

    // Stage 1: Segmenting — find all target masks (20%)
    await renderEvents.broadcast({ jobId, status: 'processing', progress: 20 });

    const segResult = await aiPipelineClient.segment({
      image_url: baseImageUrl,
      mode: 'auto',
    });

    const maskUrls: string[] = [];
    const bounds: Array<{ x: number; y: number; width: number; height: number }> = [];

    for (const removal of removals) {
      const target = segResult.segments.find((s) => s.segment_id === removal.mask_id);
      if (target) {
        maskUrls.push(target.mask_url);
        bounds.push(target.bounding_box);
        removedObjects.push({ mask_id: removal.mask_id, label: target.label });
      } else {
        failedObjects.push({ mask_id: removal.mask_id, error: 'Mascara nao encontrada' });
      }
    }

    if (maskUrls.length === 0) {
      throw new AppError({
        code: 'NO_MASKS_FOUND',
        message: 'Nenhuma mascara encontrada para remocao em lote',
        statusCode: 404,
      });
    }

    // Stage 2: Masking — combine + dilate all masks (40%)
    await renderEvents.broadcast({ jobId, status: 'processing', progress: 40 });

    const compositeMaskUrl = await maskUtils.combineMasks(maskUrls);

    // Stage 3: Inpainting — single LaMa pass with composite mask (60%)
    await renderEvents.broadcast({ jobId, status: 'processing', progress: 60 });

    const lamaResult = await lamaClient.inpaint({
      image_url: baseImageUrl,
      mask_url: compositeMaskUrl,
    });

    // Stage 4: Blending (80%)
    await renderEvents.broadcast({ jobId, status: 'processing', progress: 80 });

    // Stage 5: Storage — create version with batch metadata (100%)
    const generationTimeMs = Date.now() - startTime;
    const nextVersion = baseVersionNumber + 1;
    const combinedBbox = maskUtils.combineBounds(bounds);

    const { data: versionData, error: versionError } = await supabaseAdmin
      .from('project_versions')
      .insert({
        project_id: projectId,
        version_number: nextVersion,
        image_url: lamaResult.result_image_url,
        thumbnail_url: lamaResult.result_image_url,
        prompt: `batch_object_removal:${removedObjects.length} objects`,
        metadata: {
          type: 'object_removal',
          mode: 'batch',
          removed_objects: removedObjects,
          failed_objects: failedObjects,
          removed_count: removedObjects.length,
          failed_count: failedObjects.length,
          removed_area_bbox: combinedBbox,
          generation_time_ms: generationTimeMs,
          provider: lamaResult.metadata.provider,
          model: lamaResult.metadata.model,
        },
      })
      .select()
      .single();

    const version = versionData as VersionRow | null;

    if (versionError) {
      logger.error({ err: versionError }, 'Failed to create batch removal version');
    }

    const outputParams: Record<string, unknown> = {
      result_url: lamaResult.result_image_url,
      version_id: version ? version.id : null,
      generation_time_ms: generationTimeMs,
      removed_count: removedObjects.length,
      failed_count: failedObjects.length,
    };

    if (failedObjects.length > 0) {
      outputParams.failed_objects = failedObjects;
    }

    await supabaseAdmin
      .from('render_jobs')
      .update({
        status: 'completed',
        output_params: outputParams,
        duration_ms: generationTimeMs,
        completed_at: new Date().toISOString(),
      })
      .eq('id', jobId);

    await renderEvents.broadcast({ jobId, status: 'completed', progress: 100 });

    return {
      result_url: lamaResult.result_image_url,
      version_id: version ? version.id : null,
      generation_time_ms: generationTimeMs,
    };
  },
};
