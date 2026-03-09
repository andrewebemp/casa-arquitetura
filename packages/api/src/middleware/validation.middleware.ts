import { FastifyRequest, FastifyReply } from 'fastify';
import { ZodSchema, ZodError } from 'zod';
import { AppError } from '../lib/errors';

interface ValidationSchemas {
  body?: ZodSchema;
  params?: ZodSchema;
  querystring?: ZodSchema;
}

export const validate = (schemas: ValidationSchemas) => {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    try {
      if (schemas.body) {
        request.body = schemas.body.parse(request.body);
      }
      if (schemas.params) {
        request.params = schemas.params.parse(request.params);
      }
      if (schemas.querystring) {
        request.query = schemas.querystring.parse(request.query);
      }
    } catch (err) {
      if (err instanceof ZodError) {
        const appError = new AppError({
          code: 'VALIDATION_ERROR',
          message: 'Dados de entrada invalidos',
          statusCode: 400,
          details: err.errors,
        });
        return reply.status(400).send({
          error: {
            code: appError.code,
            message: appError.message,
            details: appError.details,
          },
        });
      }
      throw err;
    }
  };
};
