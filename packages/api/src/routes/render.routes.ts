import { FastifyInstance, FastifyRequest } from 'fastify';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  generateRenderSchema,
  projectIdParamsSchema,
  renderJobIdParamsSchema,
} from '../schemas/render.schema';
import { renderService } from '../services/render.service';
import type {
  GenerateRenderInput,
  ProjectIdParams,
  RenderJobIdParams,
} from '../schemas/render.schema';

function getAccessToken(request: FastifyRequest): string {
  return request.headers.authorization!.slice(7);
}

export async function renderRoutes(server: FastifyInstance): Promise<void> {
  // POST /projects/:id/generate - Submit render request
  server.post<{ Params: ProjectIdParams; Body: GenerateRenderInput }>(
    '/projects/:id/generate',
    {
      preHandler: [
        authMiddleware,
        validate({ params: projectIdParamsSchema, body: generateRenderSchema }),
      ],
    },
    async (request, reply) => {
      const userId = request.user!.id;
      const token = getAccessToken(request);

      const job = await renderService.createJob({
        projectId: request.params.id,
        userId,
        type: request.body.type,
        inputParams: request.body.input_params,
        accessToken: token,
      });

      return reply.status(201).send({ data: job });
    },
  );

  // GET /projects/:id/render-jobs - List render jobs for project
  server.get<{ Params: ProjectIdParams }>(
    '/projects/:id/render-jobs',
    {
      preHandler: [authMiddleware, validate({ params: projectIdParamsSchema })],
    },
    async (request, reply) => {
      const userId = request.user!.id;
      const token = getAccessToken(request);

      const jobs = await renderService.listJobs(request.params.id, userId, token);

      return reply.status(200).send({ data: jobs });
    },
  );

  // POST /render-jobs/:id/cancel - Cancel a render job
  server.post<{ Params: RenderJobIdParams }>(
    '/render-jobs/:id/cancel',
    {
      preHandler: [authMiddleware, validate({ params: renderJobIdParamsSchema })],
    },
    async (request, reply) => {
      const userId = request.user!.id;
      const token = getAccessToken(request);

      const result = await renderService.cancelJob(request.params.id, userId, token);

      return reply.status(200).send({ data: result });
    },
  );
}
