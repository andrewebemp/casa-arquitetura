import { describe, it, expect, vi } from 'vitest';
import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { validate } from '../middleware/validation.middleware';

const createMockRequest = (overrides: Partial<FastifyRequest> = {}): FastifyRequest => {
  return {
    body: {},
    params: {},
    query: {},
    ...overrides,
  } as unknown as FastifyRequest;
};

const createMockReply = (): FastifyReply => {
  const reply = {
    status: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
  } as unknown as FastifyReply;
  return reply;
};

describe('validate middleware', () => {
  it('should pass validation with valid body', async () => {
    const schema = z.object({ name: z.string(), email: z.string().email() });
    const middleware = validate({ body: schema });

    const request = createMockRequest({
      body: { name: 'John', email: 'john@example.com' },
    });
    const reply = createMockReply();

    await middleware(request, reply);

    expect(reply.status).not.toHaveBeenCalled();
    expect(request.body).toEqual({ name: 'John', email: 'john@example.com' });
  });

  it('should return 400 for invalid body', async () => {
    const schema = z.object({ name: z.string(), email: z.string().email() });
    const middleware = validate({ body: schema });

    const request = createMockRequest({
      body: { name: 123, email: 'not-an-email' },
    });
    const reply = createMockReply();

    await middleware(request, reply);

    expect(reply.status).toHaveBeenCalledWith(400);
    expect(reply.send).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({
          code: 'VALIDATION_ERROR',
          message: 'Dados de entrada invalidos',
        }),
      })
    );
  });

  it('should validate params successfully', async () => {
    const schema = z.object({ id: z.string().uuid() });
    const middleware = validate({ params: schema });

    const request = createMockRequest({
      params: { id: '550e8400-e29b-41d4-a716-446655440000' },
    });
    const reply = createMockReply();

    await middleware(request, reply);

    expect(reply.status).not.toHaveBeenCalled();
  });

  it('should return 400 for missing required params', async () => {
    const schema = z.object({ id: z.string().uuid() });
    const middleware = validate({ params: schema });

    const request = createMockRequest({ params: {} });
    const reply = createMockReply();

    await middleware(request, reply);

    expect(reply.status).toHaveBeenCalledWith(400);
  });

  it('should validate querystring', async () => {
    const schema = z.object({ page: z.coerce.number().min(1) });
    const middleware = validate({ querystring: schema });

    const request = createMockRequest({ query: { page: '2' } });
    const reply = createMockReply();

    await middleware(request, reply);

    expect(reply.status).not.toHaveBeenCalled();
    expect(request.query).toEqual({ page: 2 });
  });
});
