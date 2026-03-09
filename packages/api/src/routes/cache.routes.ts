import { FastifyInstance, FastifyRequest } from 'fastify';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { cacheHashParamSchema } from '../schemas/cache.schema';
import { semanticCacheService } from '../services/semantic-cache.service';
import { AppError } from '../lib/errors';
import type { CacheHashParam } from '../schemas/cache.schema';

const requireAdmin = async (request: FastifyRequest): Promise<void> => {
  const user = request.user;
  if (!user) {
    throw new AppError({
      code: 'UNAUTHORIZED',
      message: 'Autenticacao necessaria',
      statusCode: 401,
    });
  }

  const role = (user.app_metadata as Record<string, unknown>)?.role;
  if (role !== 'admin') {
    throw new AppError({
      code: 'FORBIDDEN',
      message: 'Acesso restrito a administradores',
      statusCode: 403,
    });
  }
};

export async function cacheRoutes(server: FastifyInstance): Promise<void> {
  // GET /api/cache/stats - Cache statistics (admin only)
  server.get(
    '/cache/stats',
    {
      preHandler: [authMiddleware, requireAdmin],
    },
    async (_request, reply) => {
      const stats = await semanticCacheService.getStats();
      return reply.status(200).send({ data: stats });
    },
  );

  // DELETE /api/cache/render/:hash - Invalidate specific cache entry (admin only)
  server.delete<{ Params: CacheHashParam }>(
    '/cache/render/:hash',
    {
      preHandler: [
        authMiddleware,
        requireAdmin,
        validate({ params: cacheHashParamSchema }),
      ],
    },
    async (request, reply) => {
      const { hash } = request.params;
      const deleted = await semanticCacheService.invalidate(hash);

      if (!deleted) {
        throw new AppError({
          code: 'CACHE_ENTRY_NOT_FOUND',
          message: 'Entrada de cache nao encontrada',
          statusCode: 404,
        });
      }

      return reply.status(200).send({ data: { hash, invalidated: true } });
    },
  );
}
