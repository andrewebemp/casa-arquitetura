import { FastifyInstance, FastifyRequest } from 'fastify';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  projectIdParamsSchema,
  versionParamsSchema,
} from '../schemas/version.schema';
import { versionService } from '../services/version.service';
import type { ProjectIdParams, VersionParams } from '../schemas/version.schema';

function getAccessToken(request: FastifyRequest): string {
  return request.headers.authorization!.slice(7);
}

export async function versionRoutes(server: FastifyInstance): Promise<void> {
  // GET /:id/versions - List all versions for a project
  server.get<{ Params: ProjectIdParams }>(
    '/:id/versions',
    {
      preHandler: [authMiddleware, validate({ params: projectIdParamsSchema })],
    },
    async (request, reply) => {
      const userId = request.user!.id;
      const token = getAccessToken(request);

      const versions = await versionService.list(request.params.id, userId, token);

      return reply.status(200).send({ data: versions });
    },
  );

  // GET /:id/versions/:versionId - Get single version
  server.get<{ Params: VersionParams }>(
    '/:id/versions/:versionId',
    {
      preHandler: [authMiddleware, validate({ params: versionParamsSchema })],
    },
    async (request, reply) => {
      const userId = request.user!.id;
      const token = getAccessToken(request);

      const version = await versionService.getById(
        request.params.id,
        request.params.versionId,
        userId,
        token,
      );

      return reply.status(200).send({ data: version });
    },
  );

  // POST /:id/versions/:versionId/revert - Revert to a specific version
  server.post<{ Params: VersionParams }>(
    '/:id/versions/:versionId/revert',
    {
      preHandler: [authMiddleware, validate({ params: versionParamsSchema })],
    },
    async (request, reply) => {
      const userId = request.user!.id;
      const token = getAccessToken(request);

      const newVersion = await versionService.revert(
        request.params.id,
        request.params.versionId,
        userId,
        token,
      );

      return reply.status(201).send({ data: newVersion });
    },
  );
}
