import { describe, it, expect, vi } from 'vitest';
import { FastifyReply, FastifyRequest } from 'fastify';
import { errorHandler } from '../middleware/error-handler';
import { AppError } from '../lib/errors';

vi.mock('../lib/logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

const createMockRequest = (): FastifyRequest => {
  return { url: '/test' } as unknown as FastifyRequest;
};

const createMockReply = (): FastifyReply => {
  const reply = {
    status: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
  } as unknown as FastifyReply;
  return reply;
};

describe('errorHandler', () => {
  it('should handle AppError with correct status and body', () => {
    const error = new AppError({
      code: 'NOT_FOUND',
      message: 'Recurso nao encontrado',
      statusCode: 404,
    });
    const request = createMockRequest();
    const reply = createMockReply();

    errorHandler(error, request, reply);

    expect(reply.status).toHaveBeenCalledWith(404);
    expect(reply.send).toHaveBeenCalledWith({
      error: { code: 'NOT_FOUND', message: 'Recurso nao encontrado' },
    });
  });

  it('should include details when AppError has details', () => {
    const details = [{ field: 'email', message: 'required' }];
    const error = new AppError({
      code: 'VALIDATION_ERROR',
      message: 'Dados invalidos',
      statusCode: 400,
      details,
    });
    const request = createMockRequest();
    const reply = createMockReply();

    errorHandler(error, request, reply);

    expect(reply.status).toHaveBeenCalledWith(400);
    expect(reply.send).toHaveBeenCalledWith({
      error: { code: 'VALIDATION_ERROR', message: 'Dados invalidos', details },
    });
  });

  it('should handle Fastify errors with statusCode', () => {
    const error = Object.assign(new Error('Bad Request'), {
      statusCode: 400,
      code: 'FST_ERR_VALIDATION',
    });
    const request = createMockRequest();
    const reply = createMockReply();

    errorHandler(error, request, reply);

    expect(reply.status).toHaveBeenCalledWith(400);
    expect(reply.send).toHaveBeenCalledWith({
      error: { code: 'FST_ERR_VALIDATION', message: 'Bad Request' },
    });
  });

  it('should handle unknown errors with 500', () => {
    const error = new Error('Something went wrong');
    const request = createMockRequest();
    const reply = createMockReply();

    errorHandler(error, request, reply);

    expect(reply.status).toHaveBeenCalledWith(500);
    expect(reply.send).toHaveBeenCalledWith({
      error: { code: 'INTERNAL_SERVER_ERROR', message: 'Erro interno do servidor' },
    });
  });
});
