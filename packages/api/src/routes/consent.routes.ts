import { FastifyInstance } from 'fastify';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { grantConsentSchema, updateTrainingOptInSchema } from '../schemas/consent.schema';
import { consentService } from '../services/consent.service';
import { dataExportService } from '../services/data-export.service';
import { accountDeletionService } from '../services/account-deletion.service';
import type { GrantConsentInput, UpdateTrainingOptInInput } from '../schemas/consent.schema';

export async function consentRoutes(server: FastifyInstance): Promise<void> {
  // GET /users/me/consent — View consent status
  server.get('/consent', {
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    const userId = request.user!.id;
    const consent = await consentService.getConsent(userId);
    return reply.status(200).send({ data: consent });
  });

  // POST /users/me/consent — Grant LGPD consent
  server.post<{ Body: GrantConsentInput }>('/consent', {
    preHandler: [authMiddleware, validate({ body: grantConsentSchema })],
  }, async (request, reply) => {
    const userId = request.user!.id;
    const consent = await consentService.grantConsent(userId, request.body.consent_version);
    return reply.status(200).send({ data: consent });
  });

  // DELETE /users/me/consent — Revoke LGPD consent (LGPD Art. 18)
  server.delete('/consent', {
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    const userId = request.user!.id;
    const consent = await consentService.revokeConsent(userId);
    return reply.status(200).send({ data: consent });
  });

  // PATCH /users/me/training-opt-in — Toggle training opt-in
  server.patch<{ Body: UpdateTrainingOptInInput }>('/training-opt-in', {
    preHandler: [authMiddleware, validate({ body: updateTrainingOptInSchema })],
  }, async (request, reply) => {
    const userId = request.user!.id;
    const consent = await consentService.updateTrainingOptIn(userId, request.body.training_opt_in);
    return reply.status(200).send({ data: consent });
  });

  // GET /users/me/data-export — Request data export (LGPD Art. 18, V)
  server.get('/data-export', {
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    const userId = request.user!.id;
    const exportData = await dataExportService.exportUserData(userId);
    return reply.status(200).send({ data: exportData });
  });

  // DELETE /users/me — Account deletion with soft-delete
  server.delete('/', {
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    const userId = request.user!.id;
    const result = await accountDeletionService.softDeleteAccount(userId);
    return reply.status(200).send({ data: result });
  });
}
