/**
 * Object Removal Routes (Story 3.3, Tasks 4-6)
 * POST /remove-object, POST /remove-object/apply, POST /remove-object/batch
 */

import { FastifyInstance, FastifyRequest } from 'fastify';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireLgpdConsent } from '../middleware/lgpd-consent.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  objectRemovalParamsSchema,
  removeObjectBodySchema,
  applyRemovalBodySchema,
  batchRemovalBodySchema,
} from '../schemas/object-removal.schema';
import { objectRemovalService } from '../services/object-removal.service';
import type {
  ObjectRemovalParams,
  RemoveObjectBody,
  ApplyRemovalBody,
  BatchRemovalBody,
} from '../schemas/object-removal.schema';

function getAccessToken(request: FastifyRequest): string {
  return request.headers.authorization!.slice(7);
}

export async function objectRemovalRoutes(server: FastifyInstance): Promise<void> {
  // POST /api/projects/:projectId/remove-object — Object selection (AC1, AC2)
  server.post<{ Params: ObjectRemovalParams; Body: RemoveObjectBody }>(
    '/:projectId/remove-object',
    {
      preHandler: [
        authMiddleware,
        requireLgpdConsent,
        validate({ params: objectRemovalParamsSchema, body: removeObjectBodySchema }),
      ],
    },
    async (request, reply) => {
      const userId = request.user!.id;
      const token = getAccessToken(request);
      const { projectId } = request.params;
      const { x, y, bounding_box } = request.body;

      const result = await objectRemovalService.selectObject({
        projectId,
        userId,
        accessToken: token,
        x,
        y,
        boundingBox: bounding_box,
      });

      return reply.status(200).send({ data: result });
    },
  );

  // POST /api/projects/:projectId/remove-object/apply — Single removal (AC3)
  server.post<{ Params: ObjectRemovalParams; Body: ApplyRemovalBody }>(
    '/:projectId/remove-object/apply',
    {
      preHandler: [
        authMiddleware,
        requireLgpdConsent,
        validate({ params: objectRemovalParamsSchema, body: applyRemovalBodySchema }),
      ],
    },
    async (request, reply) => {
      const userId = request.user!.id;
      const token = getAccessToken(request);
      const { projectId } = request.params;
      const { mask_id, fill_mode } = request.body;

      const result = await objectRemovalService.applyRemoval({
        projectId,
        userId,
        accessToken: token,
        maskId: mask_id,
        fillMode: fill_mode,
      });

      return reply.status(202).send({ data: result });
    },
  );

  // POST /api/projects/:projectId/remove-object/batch — Batch removal (AC4)
  server.post<{ Params: ObjectRemovalParams; Body: BatchRemovalBody }>(
    '/:projectId/remove-object/batch',
    {
      preHandler: [
        authMiddleware,
        requireLgpdConsent,
        validate({ params: objectRemovalParamsSchema, body: batchRemovalBodySchema }),
      ],
    },
    async (request, reply) => {
      const userId = request.user!.id;
      const token = getAccessToken(request);
      const { projectId } = request.params;
      const { removals } = request.body;

      const result = await objectRemovalService.applyBatchRemoval({
        projectId,
        userId,
        accessToken: token,
        removals,
      });

      return reply.status(202).send({ data: result });
    },
  );
}
