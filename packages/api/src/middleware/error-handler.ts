import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { AppError } from '../lib/errors';
import { logger } from '../lib/logger';

export const errorHandler = (
  error: FastifyError | AppError | Error,
  request: FastifyRequest,
  reply: FastifyReply
): void => {
  if (error instanceof AppError) {
    logger.error(
      { code: error.code, statusCode: error.statusCode, details: error.details, url: request.url },
      error.message
    );
    reply.status(error.statusCode).send({
      error: {
        code: error.code,
        message: error.message,
        ...(error.details ? { details: error.details } : {}),
      },
    });
    return;
  }

  const fastifyError = error as FastifyError;
  if (fastifyError.statusCode) {
    logger.error(
      { statusCode: fastifyError.statusCode, url: request.url },
      fastifyError.message
    );
    reply.status(fastifyError.statusCode).send({
      error: {
        code: fastifyError.code || 'FASTIFY_ERROR',
        message: fastifyError.message,
      },
    });
    return;
  }

  logger.error({ url: request.url, err: error }, 'Unhandled error');
  reply.status(500).send({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Erro interno do servidor',
    },
  });
};
