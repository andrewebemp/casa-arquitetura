import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  stagingProjectIdParamsSchema,
  variationStagingSchema,
} from '../schemas/staging.schema';
import { stagingService } from '../services/staging.service';
import { stylesRegistry } from '../services/staging-styles.registry';
import { DECOR_STYLES } from '@decorai/shared';
import type {
  StagingProjectIdParams,
  VariationStagingInput,
} from '../schemas/staging.schema';
import type { DecorStyle } from '@decorai/shared';

function getAccessToken(request: FastifyRequest): string {
  return request.headers.authorization!.slice(7);
}

export async function stagingStylesRoutes(server: FastifyInstance): Promise<void> {
  // GET /api/staging/styles - List all predefined styles (AC2)
  server.get('/styles', {
    preHandler: [authMiddleware],
  }, async (_request, reply) => {
    const styles = stylesRegistry.getAll();
    return reply.status(200).send({ data: styles });
  });
}

export async function stagingRoutes(server: FastifyInstance): Promise<void> {
  // POST /api/projects/:projectId/staging/generate - Upload photo + style selection (AC1)
  server.post<{ Params: StagingProjectIdParams }>(
    '/:projectId/staging/generate',
    {
      preHandler: [authMiddleware, validate({ params: stagingProjectIdParamsSchema })],
    },
    async (request: FastifyRequest<{ Params: StagingProjectIdParams }>, reply: FastifyReply) => {
      const userId = request.user!.id;
      const token = getAccessToken(request);
      const projectId = request.params.projectId;

      const file = await request.file();

      if (!file) {
        return reply.status(400).send({
          error: {
            code: 'NO_FILE',
            message: 'Nenhum arquivo enviado',
          },
        });
      }

      // Extract style_id from multipart fields
      const styleField = file.fields.style_id;
      let styleId: string | undefined;

      if (styleField && 'value' in styleField) {
        styleId = styleField.value as string;
      }

      if (!styleId || !DECOR_STYLES.includes(styleId as DecorStyle)) {
        return reply.status(400).send({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'style_id e obrigatorio e deve ser um estilo valido',
          },
        });
      }

      const buffer = await file.toBuffer();
      const mimeType = file.mimetype;

      const result = await stagingService.generate({
        projectId,
        userId,
        styleId: styleId as DecorStyle,
        fileBuffer: buffer,
        fileMimeType: mimeType,
        accessToken: token,
      });

      return reply.status(202).send({ data: result });
    },
  );

  // POST /api/projects/:projectId/staging/variation - 1-click style change (AC5)
  server.post<{ Params: StagingProjectIdParams; Body: VariationStagingInput }>(
    '/:projectId/staging/variation',
    {
      preHandler: [
        authMiddleware,
        validate({ params: stagingProjectIdParamsSchema, body: variationStagingSchema }),
      ],
    },
    async (request, reply) => {
      const userId = request.user!.id;
      const token = getAccessToken(request);
      const projectId = request.params.projectId;

      const result = await stagingService.variation({
        projectId,
        userId,
        styleId: request.body.style_id,
        accessToken: token,
      });

      return reply.status(202).send({ data: result });
    },
  );
}
