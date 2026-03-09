import { FastifyInstance, FastifyRequest } from 'fastify';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { updateProfileSchema } from '../schemas/profile.schema';
import { profileService } from '../services/profile.service';
import type { UpdateProfileInput } from '../schemas/profile.schema';

function getAccessToken(request: FastifyRequest): string {
  return request.headers.authorization!.slice(7);
}

export async function profileRoutes(server: FastifyInstance): Promise<void> {
  // GET /profile - Get current user profile
  server.get('/', {
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    const userId = request.user!.id;
    const token = getAccessToken(request);
    const profile = await profileService.getProfile(userId, token);
    return reply.status(200).send({ data: profile });
  });

  // PATCH /profile - Update current user profile
  server.patch<{ Body: UpdateProfileInput }>('/', {
    preHandler: [authMiddleware, validate({ body: updateProfileSchema })],
  }, async (request, reply) => {
    const userId = request.user!.id;
    const token = getAccessToken(request);
    const profile = await profileService.updateProfile(userId, request.body, token);
    return reply.status(200).send({ data: profile });
  });
}
