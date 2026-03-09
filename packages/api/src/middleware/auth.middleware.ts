import { FastifyRequest, FastifyReply } from 'fastify';
import { supabaseAdmin } from '../lib/supabase';
import { AppError } from '../lib/errors';

export const authMiddleware = async (
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> => {
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    const error = new AppError({
      code: 'UNAUTHORIZED',
      message: 'Token ausente',
      statusCode: 401,
    });
    return reply.status(401).send({ error: { code: error.code, message: error.message } });
  }

  const token = authHeader.slice(7);

  const { data, error } = await supabaseAdmin.auth.getUser(token);

  if (error || !data.user) {
    const appError = new AppError({
      code: 'UNAUTHORIZED',
      message: 'Token invalido',
      statusCode: 401,
    });
    return reply.status(401).send({ error: { code: appError.code, message: appError.message } });
  }

  request.user = data.user;
};
