/**
 * Lighting Enhancement Routes (Story 3.2, Task 5).
 * POST /:projectId/enhance-lighting — Analyze lighting + optional enhancement.
 */

import { FastifyInstance, FastifyRequest } from 'fastify';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireLgpdConsent } from '../middleware/lgpd-consent.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  enhanceLightingParamsSchema,
  enhanceLightingBodySchema,
} from '../schemas/lighting.schema';
import { lightingService } from '../services/lighting.service';
import type {
  EnhanceLightingParams,
  EnhanceLightingBody,
} from '../schemas/lighting.schema';

function getAccessToken(request: FastifyRequest): string {
  return request.headers.authorization!.slice(7);
}

export async function lightingRoutes(server: FastifyInstance): Promise<void> {
  // POST /api/projects/:projectId/enhance-lighting — Lighting analysis + enhancement (AC1-AC3)
  server.post<{ Params: EnhanceLightingParams; Body: EnhanceLightingBody }>(
    '/:projectId/enhance-lighting',
    {
      preHandler: [
        authMiddleware,
        requireLgpdConsent,
        validate({ params: enhanceLightingParamsSchema, body: enhanceLightingBodySchema }),
      ],
    },
    async (request, reply) => {
      const userId = request.user!.id;
      const token = getAccessToken(request);
      const { projectId } = request.params;
      const { image_version_id, mode, auto_enhance } = request.body;

      const result = await lightingService.analyzeLighting({
        projectId,
        userId,
        imageVersionId: image_version_id,
        mode: mode || 'auto',
        autoEnhance: auto_enhance || false,
        accessToken: token,
      });

      // If a job was created, return 202 Accepted
      if (result.job_id) {
        return reply.status(202).send({ data: result });
      }

      // Analysis only, return 200
      return reply.status(200).send({ data: result });
    },
  );
}
