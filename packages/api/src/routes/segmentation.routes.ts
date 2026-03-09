/**
 * Segmentation Routes (Story 3.1, Tasks 5-6, 8-9)
 * POST /segment, POST /segment/all, POST /segment/apply, GET /segment/:segmentId/materials
 */

import { FastifyInstance, FastifyRequest } from 'fastify';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  segmentProjectParamsSchema,
  segmentPointBodySchema,
  segmentApplyBodySchema,
  segmentIdParamsSchema,
} from '../schemas/segmentation.schema';
import { segmentationService } from '../services/segmentation.service';
import type {
  SegmentProjectParams,
  SegmentPointBody,
  SegmentApplyBody,
  SegmentIdParams,
} from '../schemas/segmentation.schema';

function getAccessToken(request: FastifyRequest): string {
  return request.headers.authorization!.slice(7);
}

export async function segmentationRoutes(server: FastifyInstance): Promise<void> {
  // POST /api/projects/:projectId/segment — Point-based segmentation (AC1)
  server.post<{ Params: SegmentProjectParams; Body: SegmentPointBody }>(
    '/:projectId/segment',
    {
      preHandler: [
        authMiddleware,
        validate({ params: segmentProjectParamsSchema, body: segmentPointBodySchema }),
      ],
    },
    async (request, reply) => {
      const userId = request.user!.id;
      const token = getAccessToken(request);
      const { projectId } = request.params;
      const { x, y, box } = request.body;

      const result = await segmentationService.segmentPoint({
        projectId,
        userId,
        x,
        y,
        box,
        accessToken: token,
      });

      return reply.status(200).send({ data: result });
    },
  );

  // POST /api/projects/:projectId/segment/all — Auto-detect all elements (AC2)
  server.post<{ Params: SegmentProjectParams }>(
    '/:projectId/segment/all',
    {
      preHandler: [
        authMiddleware,
        validate({ params: segmentProjectParamsSchema }),
      ],
    },
    async (request, reply) => {
      const userId = request.user!.id;
      const token = getAccessToken(request);
      const { projectId } = request.params;

      const result = await segmentationService.segmentAll({
        projectId,
        userId,
        accessToken: token,
      });

      return reply.status(200).send({ data: result });
    },
  );

  // POST /api/projects/:projectId/segment/apply — Material swap on segment (AC3)
  server.post<{ Params: SegmentProjectParams; Body: SegmentApplyBody }>(
    '/:projectId/segment/apply',
    {
      preHandler: [
        authMiddleware,
        validate({ params: segmentProjectParamsSchema, body: segmentApplyBodySchema }),
      ],
    },
    async (request, reply) => {
      const userId = request.user!.id;
      const token = getAccessToken(request);
      const { projectId } = request.params;
      const { segment_id, material_descriptor } = request.body;

      const result = await segmentationService.applyMaterialSwap({
        projectId,
        userId,
        segmentId: segment_id,
        materialDescriptor: material_descriptor,
        accessToken: token,
      });

      return reply.status(202).send({ data: result });
    },
  );

  // GET /api/projects/:projectId/segment/:segmentId/materials — Suggested materials (AC5)
  server.get<{ Params: SegmentIdParams }>(
    '/:projectId/segment/:segmentId/materials',
    {
      preHandler: [
        authMiddleware,
        validate({ params: segmentIdParamsSchema }),
      ],
    },
    async (request, reply) => {
      const { segmentId } = request.params;

      // segmentId format may carry category info, or we default to returning all
      const materials = segmentationService.getSuggestedMaterials(segmentId);

      return reply.status(200).send({ data: materials });
    },
  );
}
