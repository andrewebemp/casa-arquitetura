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
import { imageCdnService } from '../services/image-cdn.service';
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
  // POST /projects - Create new project (accepts multipart with optional photo)
  server.post('/', {
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    const userId = request.user!.id;
    const token = getAccessToken(request);

    let fields: Record<string, string> = {};
    let photoBuffer: Buffer | null = null;
    let photoMimeType = '';

    if (request.isMultipart()) {
      const parts = request.parts();
      for await (const part of parts) {
        if (part.type === 'file' && part.fieldname === 'photo') {
          photoBuffer = await part.toBuffer();
          photoMimeType = part.mimetype;
        } else if (part.type === 'field' && typeof part.value === 'string') {
          fields[part.fieldname] = part.value;
        }
      }
    } else {
      fields = request.body as Record<string, string>;
    }

    const parsed = createProjectSchema.safeParse(fields);
    if (!parsed.success) {
      return reply.status(400).send({
        error: { code: 'VALIDATION_ERROR', message: parsed.error.issues[0]?.message ?? 'Dados invalidos' },
      });
    }

    const project = await projectService.create(userId, parsed.data, token);

    // If photo was included, upload it and link to the project
    if (photoBuffer && photoMimeType) {
      storageService.validateFile(photoBuffer, photoMimeType);
      const uploadResult = await storageService.upload(photoBuffer, photoMimeType, userId, project.id);
      await projectService.updateImageUrl(project.id, userId, uploadResult.image_url, token);
      const resolvedUrl = await imageCdnService.resolveImageUrl(uploadResult.image_url);
      return reply.status(201).send({
        data: { ...project, original_image_url: resolvedUrl ?? uploadResult.image_url },
      });
    }

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
      favorite: request.query.favorite,
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

    // Store the storage path in DB (never expires)
    await projectService.updateImageUrl(projectId, userId, result.image_url, token);

    // Return a resolved URL to the frontend for immediate display
    const resolvedUrl = await imageCdnService.resolveImageUrl(result.image_url);

    return reply.status(201).send({
      data: {
        ...result,
        image_url: resolvedUrl ?? result.image_url,
      },
    });
  });
}
