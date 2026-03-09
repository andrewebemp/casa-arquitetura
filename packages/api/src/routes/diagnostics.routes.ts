import { FastifyInstance, FastifyRequest } from 'fastify';
import { validate } from '../middleware/validation.middleware';
import {
  createDiagnosticBodySchema,
  diagnosticIdParamsSchema,
} from '../schemas/diagnostic.schema';
import type { CreateDiagnosticBody, DiagnosticIdParams } from '../schemas/diagnostic.schema';
import { diagnosticService } from '../services/diagnostic.service';

const SESSION_COOKIE = 'diag_session';
const SESSION_MAX_AGE = 7 * 24 * 60 * 60;

function getSessionToken(request: FastifyRequest): string | undefined {
  const cookies = request.headers.cookie;
  if (!cookies) return undefined;
  const match = cookies.match(new RegExp(`${SESSION_COOKIE}=([^;]+)`));
  return match ? match[1] : undefined;
}

async function tryAuth(request: FastifyRequest): Promise<void> {
  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return;

  const { supabaseAdmin } = await import('../lib/supabase');
  const token = authHeader.slice(7);
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (!error && data.user) {
    request.user = data.user;
  }
}

// Public routes — no auth required (anonymous diagnostics)
export async function diagnosticsRoutes(server: FastifyInstance): Promise<void> {
  // POST /diagnostics — AC-1: Create diagnostic (anonymous or authenticated)
  server.post<{ Body: CreateDiagnosticBody }>(
    '/diagnostics',
    {
      preHandler: [validate({ body: createDiagnosticBodySchema })],
    },
    async (request, reply) => {
      await tryAuth(request);

      const userId = request.user?.id;
      const sessionToken = getSessionToken(request);

      const result = await diagnosticService.createDiagnostic({
        userId,
        propertyType: request.body.property_type,
        location: request.body.location,
      });

      if (result.session_token) {
        reply.header(
          'Set-Cookie',
          `${SESSION_COOKIE}=${result.session_token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_MAX_AGE}`,
        );
      }

      // Link anonymous diagnostics if user is now authenticated
      if (userId && sessionToken) {
        await diagnosticService.linkAnonymousDiagnostics({
          sessionToken,
          userId,
        });
      }

      return reply.status(201).send({
        data: {
          id: result.id,
          session_token: result.session_token,
        },
      });
    },
  );

  // POST /diagnostics/:id/upload — AC-2: Upload photo
  server.post<{ Params: DiagnosticIdParams }>(
    '/diagnostics/:id/upload',
    {
      preHandler: [validate({ params: diagnosticIdParamsSchema })],
    },
    async (request, reply) => {
      await tryAuth(request);

      const { id } = request.params;
      const userId = request.user?.id;
      const sessionToken = getSessionToken(request);

      const file = await request.file();
      if (!file) {
        return reply.status(400).send({
          error: {
            code: 'FILE_REQUIRED',
            message: 'Envie uma imagem para o diagnostico',
          },
        });
      }

      const fileBuffer = await file.toBuffer();
      const mimetype = file.mimetype;

      const result = await diagnosticService.uploadImage({
        diagnosticId: id,
        userId,
        sessionToken,
        fileBuffer,
        mimetype,
      });

      return reply.status(200).send({ data: result });
    },
  );

  // GET /diagnostics/:id — AC-4: Get diagnostic result with CTA
  server.get<{ Params: DiagnosticIdParams }>(
    '/diagnostics/:id',
    {
      preHandler: [validate({ params: diagnosticIdParamsSchema })],
    },
    async (request, reply) => {
      await tryAuth(request);

      const { id } = request.params;
      const userId = request.user?.id;
      const sessionToken = getSessionToken(request);

      const result = await diagnosticService.getDiagnostic({
        diagnosticId: id,
        userId,
        sessionToken,
      });

      return reply.status(200).send({ data: result });
    },
  );
}
