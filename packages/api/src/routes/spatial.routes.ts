import { FastifyInstance } from 'fastify';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  upsertSpatialInputSchema,
  projectIdParamsSchema,
} from '../schemas/spatial.schema';
import { spatialService } from '../services/spatial.service';
import type { UpsertSpatialInput, ProjectIdParams } from '../schemas/spatial.schema';
import type { FastifyRequest } from 'fastify';

function getAccessToken(request: FastifyRequest): string {
  return request.headers.authorization!.slice(7);
}

export async function spatialRoutes(server: FastifyInstance): Promise<void> {
  // PUT /projects/:id/spatial-input - Create/update spatial input
  server.put<{ Params: ProjectIdParams; Body: UpsertSpatialInput }>('/:id/spatial-input', {
    preHandler: [authMiddleware, validate({ params: projectIdParamsSchema, body: upsertSpatialInputSchema })],
  }, async (request, reply) => {
    const userId = request.user!.id;
    const token = getAccessToken(request);
    const data = await spatialService.upsert(request.params.id, userId, request.body, token);
    return reply.status(200).send({ data });
  });

  // GET /projects/:id/spatial-input - Get spatial input
  server.get<{ Params: ProjectIdParams }>('/:id/spatial-input', {
    preHandler: [authMiddleware, validate({ params: projectIdParamsSchema })],
  }, async (request, reply) => {
    const userId = request.user!.id;
    const token = getAccessToken(request);
    const data = await spatialService.get(request.params.id, userId, token);
    return reply.status(200).send({ data });
  });
}
