import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  renderIdParamsSchema,
  createRatingSchema,
  npsSubmitSchema,
  analyticsQuerySchema,
} from '../schemas/rating.schema';
import { ratingService } from '../services/rating.service';
import type {
  RenderIdParams,
  CreateRatingBody,
  NpsSubmitBody,
  AnalyticsQuery,
} from '../schemas/rating.schema';

const requireAdmin = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
  const role = request.user?.app_metadata?.role;
  if (role !== 'admin') {
    return reply.status(403).send({ error: { code: 'FORBIDDEN', message: 'Acesso restrito a administradores' } });
  }
};

export async function ratingRoutes(server: FastifyInstance): Promise<void> {
  // POST /api/renders/:renderId/rating
  server.post<{ Params: RenderIdParams; Body: CreateRatingBody }>(
    '/renders/:renderId/rating',
    {
      preHandler: [
        authMiddleware,
        validate({ params: renderIdParamsSchema, body: createRatingSchema }),
      ],
    },
    async (request, reply) => {
      const userId = request.user!.id;
      const { renderId } = request.params;
      const data = await ratingService.upsertRating(renderId, userId, request.body);
      return reply.status(201).send({ data });
    },
  );

  // GET /api/renders/:renderId/rating
  server.get<{ Params: RenderIdParams }>(
    '/renders/:renderId/rating',
    {
      preHandler: [
        authMiddleware,
        validate({ params: renderIdParamsSchema }),
      ],
    },
    async (request, reply) => {
      const userId = request.user!.id;
      const { renderId } = request.params;
      const data = await ratingService.getRating(renderId, userId);
      if (!data) {
        return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Avaliacao nao encontrada' } });
      }
      return reply.status(200).send({ data });
    },
  );

  // POST /api/nps/submit
  server.post<{ Body: NpsSubmitBody }>(
    '/nps/submit',
    {
      preHandler: [
        authMiddleware,
        validate({ body: npsSubmitSchema }),
      ],
    },
    async (request, reply) => {
      const userId = request.user!.id;
      const data = await ratingService.submitNps(userId, request.body);
      return reply.status(201).send({ data });
    },
  );

  // POST /api/nps/dismiss
  server.post(
    '/nps/dismiss',
    { preHandler: [authMiddleware] },
    async (request, reply) => {
      const userId = request.user!.id;
      await ratingService.dismissNps(userId);
      return reply.status(204).send();
    },
  );

  // GET /api/nps/should-show
  server.get(
    '/nps/should-show',
    { preHandler: [authMiddleware] },
    async (request, reply) => {
      const userId = request.user!.id;
      const shouldShow = await ratingService.shouldShowNps(userId);
      return reply.status(200).send({ data: { should_show: shouldShow } });
    },
  );
}

export async function analyticsRoutes(server: FastifyInstance): Promise<void> {
  // GET /api/admin/analytics/ratings
  server.get<{ Querystring: AnalyticsQuery }>(
    '/ratings',
    {
      preHandler: [
        authMiddleware,
        requireAdmin,
        validate({ querystring: analyticsQuerySchema }),
      ],
    },
    async (request, reply) => {
      const data = await ratingService.getRatingAnalytics(request.query);
      return reply.status(200).send({ data });
    },
  );

  // GET /api/admin/analytics/nps
  server.get<{ Querystring: AnalyticsQuery }>(
    '/nps',
    {
      preHandler: [
        authMiddleware,
        requireAdmin,
        validate({ querystring: analyticsQuerySchema }),
      ],
    },
    async (request, reply) => {
      const data = await ratingService.getNpsAnalytics(request.query);
      return reply.status(200).send({ data });
    },
  );
}
