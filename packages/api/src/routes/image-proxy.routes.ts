import { FastifyInstance, FastifyRequest } from 'fastify';
import { authMiddleware } from '../middleware/auth.middleware';
import { supabaseAdmin } from '../lib/supabase';
import { imageCdnService } from '../services/image-cdn.service';
import { AppError } from '../lib/errors';
import { logger } from '../lib/logger';

interface ImageProxyParams {
  '*': string;
}

export async function imageProxyRoutes(server: FastifyInstance): Promise<void> {
  // GET /api/images/* - Proxy images from Supabase Storage with CDN cache headers
  // Path format: /api/images/{storagePath}
  // Example: /api/images/userId/projectId/original.jpg
  server.get<{ Params: ImageProxyParams }>(
    '/images/*',
    {
      preHandler: [authMiddleware],
    },
    async (request: FastifyRequest<{ Params: ImageProxyParams }>, reply) => {
      const storagePath = request.params['*'];

      if (!storagePath) {
        throw new AppError({
          code: 'INVALID_PATH',
          message: 'Caminho da imagem e obrigatorio',
          statusCode: 400,
        });
      }

      const { data, error } = await supabaseAdmin.storage
        .from('project-images')
        .download(storagePath);

      if (error || !data) {
        logger.error({ err: error, path: storagePath }, 'Failed to download image from storage');
        throw new AppError({
          code: 'IMAGE_NOT_FOUND',
          message: 'Imagem nao encontrada',
          statusCode: 404,
        });
      }

      const buffer = Buffer.from(await data.arrayBuffer());
      const etag = imageCdnService.generateETag(storagePath);
      const cacheHeaders = imageCdnService.generateCacheHeaders({
        isPublic: false,
        etag,
      });

      const ifNoneMatch = request.headers['if-none-match'];
      if (ifNoneMatch === `"${etag}"`) {
        return reply.status(304).send();
      }

      const contentType = data.type || 'image/jpeg';

      return reply
        .status(200)
        .header('Content-Type', contentType)
        .header('Cache-Control', cacheHeaders['Cache-Control'])
        .header('ETag', cacheHeaders['ETag'])
        .header('CDN-Cache-Control', cacheHeaders['CDN-Cache-Control'])
        .send(buffer);
    },
  );
}
