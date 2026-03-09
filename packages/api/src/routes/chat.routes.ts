import { FastifyInstance, FastifyRequest } from 'fastify';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  projectIdParamsSchema,
  sendChatMessageSchema,
  chatHistoryQuerySchema,
} from '../schemas/chat.schema';
import { chatService } from '../services/chat.service';
import type {
  ProjectIdParams,
  SendChatMessageInput,
  ChatHistoryQuery,
} from '../schemas/chat.schema';

function getAccessToken(request: FastifyRequest): string {
  return request.headers.authorization!.slice(7);
}

export async function chatRoutes(server: FastifyInstance): Promise<void> {
  // POST /:id/chat - Send chat message for refinement
  server.post<{ Params: ProjectIdParams; Body: SendChatMessageInput }>(
    '/:id/chat',
    {
      preHandler: [
        authMiddleware,
        validate({ params: projectIdParamsSchema, body: sendChatMessageSchema }),
      ],
    },
    async (request, reply) => {
      const userId = request.user!.id;
      const token = getAccessToken(request);

      const result = await chatService.sendMessage(
        request.params.id,
        userId,
        request.body.message,
        token,
      );

      return reply.status(202).send({ data: result });
    },
  );

  // GET /:id/chat/history - Get chat history for project
  server.get<{ Params: ProjectIdParams; Querystring: ChatHistoryQuery }>(
    '/:id/chat/history',
    {
      preHandler: [
        authMiddleware,
        validate({ params: projectIdParamsSchema, querystring: chatHistoryQuerySchema }),
      ],
    },
    async (request, reply) => {
      const userId = request.user!.id;
      const token = getAccessToken(request);

      const messages = await chatService.getHistory(
        request.params.id,
        userId,
        token,
        request.query.limit,
        request.query.cursor,
      );

      return reply.status(200).send({ data: messages });
    },
  );
}
