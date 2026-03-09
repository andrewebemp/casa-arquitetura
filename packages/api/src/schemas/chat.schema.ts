import { z } from 'zod';

export const projectIdParamsSchema = z.object({
  id: z.string().uuid('ID deve ser um UUID valido'),
});

export const sendChatMessageSchema = z.object({
  message: z.string().min(1, 'Mensagem e obrigatoria').max(1000, 'Mensagem deve ter no maximo 1000 caracteres'),
});

export const chatHistoryQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  cursor: z.string().optional(),
});

export type ProjectIdParams = z.infer<typeof projectIdParamsSchema>;
export type SendChatMessageInput = z.infer<typeof sendChatMessageSchema>;
export type ChatHistoryQuery = z.infer<typeof chatHistoryQuerySchema>;
