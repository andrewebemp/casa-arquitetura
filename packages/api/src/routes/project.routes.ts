import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  createProjectSchema,
  updateProjectSchema,
  listProjectsQuerySchema,
  projectIdParamsSchema,
} from '../schemas/project.schema';
import { projectService } from '../services/project.service';
import { storageService } from '../services/storage.service';
import type {
  CreateProjectInput,
  UpdateProjectInput,
  ListProjectsQuery,
  ProjectIdParams,
} from '../schemas/project.schema';

function getAccessToken(request: FastifyRequest): string {
  return request.headers.authorization!.slice(7);
}

export async function projectRoutes(server: FastifyInstance): Promise<void> {
  // POST /projects - Create new project
  server.post<{ Body: CreateProjectInput }>('/', {
    preHandler: [authMiddleware, validate({ body: createProjectSchema })],
  }, async (request, reply) => {
    const userId = request.user!.id;
    const token = getAccessToken(request);
    const project = await projectService.create(userId, request.body, token);
    return reply.status(201).send({ data: project });
  });

  // GET /projects - List user projects
  server.get<{ Querystring: ListProjectsQuery }>('/', {
    preHandler: [authMiddleware, validate({ querystring: listProjectsQuerySchema })],
  }, async (request, reply) => {
    const userId = request.user!.id;
    const token = getAccessToken(request);
    const result = await projectService.list(userId, token, {
      limit: request.query.limit,
      cursor: request.query.cursor,
      status: request.query.status,
    });
    return reply.status(200).send(result);
  });

  // GET /projects/:id - Get project details
  server.get<{ Params: ProjectIdParams }>('/:id', {
    preHandler: [authMiddleware, validate({ params: projectIdParamsSchema })],
  }, async (request, reply) => {
    const userId = request.user!.id;
    const token = getAccessToken(request);
    const project = await projectService.getById(request.params.id, userId, token);
    return reply.status(200).send({ data: project });
  });

  // PATCH /projects/:id - Update project
  server.patch<{ Params: ProjectIdParams; Body: UpdateProjectInput }>('/:id', {
    preHandler: [authMiddleware, validate({ params: projectIdParamsSchema, body: updateProjectSchema })],
  }, async (request, reply) => {
    const userId = request.user!.id;
    const token = getAccessToken(request);
    const project = await projectService.update(request.params.id, userId, request.body, token);
    return reply.status(200).send({ data: project });
  });

  // DELETE /projects/:id - Delete project
  server.delete<{ Params: ProjectIdParams }>('/:id', {
    preHandler: [authMiddleware, validate({ params: projectIdParamsSchema })],
  }, async (request, reply) => {
    const userId = request.user!.id;
    const token = getAccessToken(request);
    await projectService.delete(request.params.id, userId, token);
    return reply.status(204).send();
  });

  // POST /projects/:id/upload - Upload room photo
  server.post<{ Params: ProjectIdParams }>('/:id/upload', {
    preHandler: [authMiddleware, validate({ params: projectIdParamsSchema })],
  }, async (request: FastifyRequest<{ Params: ProjectIdParams }>, reply: FastifyReply) => {
    const userId = request.user!.id;
    const token = getAccessToken(request);
    const projectId = request.params.id;

    await storageService.verifyProjectOwnership(projectId, userId, token);

    const file = await request.file();

    if (!file) {
      return reply.status(400).send({
        error: {
          code: 'NO_FILE',
          message: 'Nenhum arquivo enviado',
        },
      });
    }

    const buffer = await file.toBuffer();
    const mimeType = file.mimetype;

    storageService.validateFile(buffer, mimeType);

    const result = await storageService.upload(buffer, mimeType, userId, projectId);

    await projectService.updateImageUrl(projectId, userId, result.image_url, token);

    return reply.status(201).send({ data: result });
  });
}
