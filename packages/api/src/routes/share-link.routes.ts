import { FastifyInstance, FastifyRequest } from 'fastify';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  shareProjectIdParamsSchema,
  shareIdParamsSchema,
  shareTokenParamsSchema,
  sliderDataQuerySchema,
  createShareSchema,
} from '../schemas/share.schema';
import { shareLinkService } from '../services/share-link.service';
import type {
  ShareProjectIdParams,
  ShareIdParams,
  ShareTokenParams,
  SliderDataQuery,
  CreateShareInput,
} from '../schemas/share.schema';

function getAccessToken(request: FastifyRequest): string {
  return request.headers.authorization!.slice(7);
}

// Authenticated routes registered under /api/projects
export async function shareLinkRoutes(server: FastifyInstance): Promise<void> {
  // GET /api/projects/:projectId/slider-data — AC1
  server.get<{ Params: ShareProjectIdParams; Querystring: SliderDataQuery }>(
    '/:projectId/slider-data',
    {
      preHandler: [
        authMiddleware,
        validate({ params: shareProjectIdParamsSchema, querystring: sliderDataQuerySchema }),
      ],
    },
    async (request, reply) => {
      const userId = request.user!.id;
      const token = getAccessToken(request);
      const { projectId } = request.params;
      const { version_id } = request.query;

      const data = await shareLinkService.getSliderData(projectId, userId, token, version_id);
      return reply.status(200).send({ data });
    },
  );

  // POST /api/projects/:projectId/share — AC2
  server.post<{ Params: ShareProjectIdParams; Body: CreateShareInput }>(
    '/:projectId/share',
    {
      preHandler: [
        authMiddleware,
        validate({ params: shareProjectIdParamsSchema, body: createShareSchema }),
      ],
    },
    async (request, reply) => {
      const userId = request.user!.id;
      const token = getAccessToken(request);
      const { projectId } = request.params;

      const data = await shareLinkService.createShareLink(
        projectId,
        userId,
        token,
        request.body,
      );
      return reply.status(201).send({ data });
    },
  );

  // GET /api/projects/:projectId/shares — AC4
  server.get<{ Params: ShareProjectIdParams }>(
    '/:projectId/shares',
    {
      preHandler: [
        authMiddleware,
        validate({ params: shareProjectIdParamsSchema }),
      ],
    },
    async (request, reply) => {
      const userId = request.user!.id;
      const token = getAccessToken(request);
      const { projectId } = request.params;

      const data = await shareLinkService.listByProject(projectId, userId, token);
      return reply.status(200).send({ data });
    },
  );

  // DELETE /api/projects/:projectId/shares/:shareId — AC4
  server.delete<{ Params: ShareIdParams }>(
    '/:projectId/shares/:shareId',
    {
      preHandler: [
        authMiddleware,
        validate({ params: shareIdParamsSchema }),
      ],
    },
    async (request, reply) => {
      const userId = request.user!.id;
      const token = getAccessToken(request);
      const { projectId, shareId } = request.params;

      await shareLinkService.deleteShareLink(projectId, shareId, userId, token);
      return reply.status(204).send();
    },
  );
}

// Public route registered under /api/share (no auth required)
export async function publicShareRoutes(server: FastifyInstance): Promise<void> {
  // GET /api/share/:shareToken — AC3
  server.get<{ Params: ShareTokenParams }>(
    '/:shareToken',
    {
      preHandler: [validate({ params: shareTokenParamsSchema })],
    },
    async (request, reply) => {
      const { shareToken } = request.params;
      const data = await shareLinkService.getByToken(shareToken);
      return reply.status(200).send({ data });
    },
  );
}
