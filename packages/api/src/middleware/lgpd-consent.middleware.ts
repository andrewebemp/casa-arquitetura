import { FastifyRequest, FastifyReply } from 'fastify';
import { consentService } from '../services/consent.service';

export const requireLgpdConsent = async (
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> => {
  const user = request.user;

  if (!user) {
    return reply.status(401).send({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Token ausente',
      },
    });
  }

  const hasConsent = await consentService.hasConsent(user.id);

  if (!hasConsent) {
    return reply.status(403).send({
      error: {
        code: 'LGPD_CONSENT_REQUIRED',
        message: 'Consentimento LGPD necessario para processar imagens',
      },
    });
  }
};
