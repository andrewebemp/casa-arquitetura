import { FastifyInstance, FastifyRequest } from 'fastify';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  projectIdParamsSchema,
  adjustCroquiSchema,
} from '../schemas/croqui.schema';
import { croquiService } from '../services/croqui.service';
import { photoAnalysisService } from '../services/photo-analysis.service';
import type { ProjectIdParams, AdjustCroquiInput } from '../schemas/croqui.schema';

function getAccessToken(request: FastifyRequest): string {
  return request.headers.authorization!.slice(7);
}

export async function croquiRoutes(server: FastifyInstance): Promise<void> {
  // POST /projects/:id/analyze - Analyze photo, extract spatial data, generate croqui
  server.post<{ Params: ProjectIdParams }>(
    '/:id/analyze',
    {
      preHandler: [authMiddleware, validate({ params: projectIdParamsSchema })],
    },
    async (request, reply) => {
      const userId = request.user!.id;
      const token = getAccessToken(request);

      const result = await photoAnalysisService.analyze(request.params.id, userId, token);

      return reply.status(200).send({ data: result });
    },
  );

  // GET /projects/:id/croqui - Get current croqui + turn number
  server.get<{ Params: ProjectIdParams }>(
    '/:id/croqui',
    {
      preHandler: [authMiddleware, validate({ params: projectIdParamsSchema })],
    },
    async (request, reply) => {
      const userId = request.user!.id;
      const token = getAccessToken(request);

      const data = await croquiService.getCroqui(request.params.id, userId, token);

      return reply.status(200).send({ data });
    },
  );

  // POST /projects/:id/croqui/adjust - Adjust croqui with user instructions
  server.post<{ Params: ProjectIdParams; Body: AdjustCroquiInput }>(
    '/:id/croqui/adjust',
    {
      preHandler: [
        authMiddleware,
        validate({ params: projectIdParamsSchema, body: adjustCroquiSchema }),
      ],
    },
    async (request, reply) => {
      const userId = request.user!.id;
      const token = getAccessToken(request);

      const data = await croquiService.adjust(
        request.params.id,
        userId,
        request.body.instructions,
        token,
      );

      return reply.status(200).send({ data });
    },
  );

  // POST /projects/:id/croqui/approve - Approve croqui, unlock generation
  server.post<{ Params: ProjectIdParams }>(
    '/:id/croqui/approve',
    {
      preHandler: [authMiddleware, validate({ params: projectIdParamsSchema })],
    },
    async (request, reply) => {
      const userId = request.user!.id;
      const token = getAccessToken(request);

      const data = await croquiService.approve(request.params.id, userId, token);

      return reply.status(200).send({ data });
    },
  );
}
