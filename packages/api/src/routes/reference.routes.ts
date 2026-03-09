import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  createReferenceItemSchema,
  projectIdParamsSchema,
  referenceItemParamsSchema,
} from '../schemas/spatial.schema';
import { referenceService } from '../services/reference.service';
import type {
  ProjectIdParams,
  ReferenceItemParams,
} from '../schemas/spatial.schema';

function getAccessToken(request: FastifyRequest): string {
  return request.headers.authorization!.slice(7);
}

export async function referenceRoutes(server: FastifyInstance): Promise<void> {
  // POST /projects/:id/references - Create reference item with image
  server.post<{ Params: ProjectIdParams }>('/:id/references', {
    preHandler: [authMiddleware, validate({ params: projectIdParamsSchema })],
  }, async (request: FastifyRequest<{ Params: ProjectIdParams }>, reply: FastifyReply) => {
    const userId = request.user!.id;
    const token = getAccessToken(request);
    const projectId = request.params.id;

    await referenceService.verifyProjectOwnership(projectId, userId, token);

    const data = await request.file();

    if (!data) {
      return reply.status(400).send({
        error: {
          code: 'NO_FILE',
          message: 'Nenhum arquivo enviado',
        },
      });
    }

    // Parse JSON fields from multipart
    const fields: Record<string, string> = {};
    for (const [key, field] of Object.entries(data.fields)) {
      if (field && typeof field === 'object' && 'value' in field) {
        fields[key] = (field as { value: string }).value;
      }
    }

    // Parse numeric fields
    const input = createReferenceItemSchema.parse({
      name: fields.name,
      width_m: fields.width_m ? Number(fields.width_m) : undefined,
      depth_m: fields.depth_m ? Number(fields.depth_m) : undefined,
      height_m: fields.height_m ? Number(fields.height_m) : undefined,
      material: fields.material || undefined,
      color: fields.color || undefined,
      position_description: fields.position_description || undefined,
    });

    const buffer = await data.toBuffer();
    const mimeType = data.mimetype;

    referenceService.validateFile(buffer, mimeType);

    const item = await referenceService.create(projectId, userId, input, buffer, mimeType, token);
    return reply.status(201).send({ data: item });
  });

  // GET /projects/:id/references - List reference items
  server.get<{ Params: ProjectIdParams }>('/:id/references', {
    preHandler: [authMiddleware, validate({ params: projectIdParamsSchema })],
  }, async (request, reply) => {
    const userId = request.user!.id;
    const token = getAccessToken(request);
    const items = await referenceService.list(request.params.id, userId, token);
    return reply.status(200).send({ data: items });
  });

  // GET /projects/:id/references/:refId - Get reference item
  server.get<{ Params: ReferenceItemParams }>('/:id/references/:refId', {
    preHandler: [authMiddleware, validate({ params: referenceItemParamsSchema })],
  }, async (request, reply) => {
    const userId = request.user!.id;
    const token = getAccessToken(request);
    const item = await referenceService.getById(request.params.id, request.params.refId, userId, token);
    return reply.status(200).send({ data: item });
  });

  // DELETE /projects/:id/references/:refId - Delete reference item
  server.delete<{ Params: ReferenceItemParams }>('/:id/references/:refId', {
    preHandler: [authMiddleware, validate({ params: referenceItemParamsSchema })],
  }, async (request, reply) => {
    const userId = request.user!.id;
    const token = getAccessToken(request);
    await referenceService.delete(request.params.id, request.params.refId, userId, token);
    return reply.status(204).send();
  });
}
