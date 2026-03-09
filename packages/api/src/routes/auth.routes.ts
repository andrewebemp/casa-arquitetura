import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { signupSchema, loginSchema, googleAuthSchema, refreshSchema } from '../schemas/auth.schema';
import { authService } from '../services/auth.service';
import type { SignupInput, LoginInput, GoogleAuthInput, RefreshInput } from '../schemas/auth.schema';

export async function authRoutes(server: FastifyInstance): Promise<void> {
  server.post<{ Body: SignupInput }>('/signup', {
    preHandler: [validate({ body: signupSchema })],
  }, async (request, reply) => {
    const { email, password } = request.body;
    const data = await authService.signUpWithEmail(email, password);
    return reply.status(201).send({
      access_token: data.session?.access_token,
      refresh_token: data.session?.refresh_token,
      user: data.user,
    });
  });

  server.post<{ Body: LoginInput }>('/login', {
    preHandler: [validate({ body: loginSchema })],
  }, async (request, reply) => {
    const { email, password } = request.body;
    const data = await authService.signInWithEmail(email, password);
    return reply.status(200).send({
      access_token: data.session?.access_token,
      refresh_token: data.session?.refresh_token,
      expires_in: data.session?.expires_in,
      user: data.user,
    });
  });

  server.post<{ Body: GoogleAuthInput }>('/google', {
    preHandler: [validate({ body: googleAuthSchema })],
  }, async (request, reply) => {
    const { id_token } = request.body;
    const data = await authService.signInWithGoogle(id_token);
    return reply.status(200).send({
      access_token: data.session?.access_token,
      refresh_token: data.session?.refresh_token,
      user: data.user,
    });
  });

  server.get('/me', {
    preHandler: [authMiddleware],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const token = request.headers.authorization!.slice(7);
    const profile = await authService.getUser(token);
    return reply.status(200).send(profile);
  });

  server.post<{ Body: RefreshInput }>('/refresh', {
    preHandler: [validate({ body: refreshSchema })],
  }, async (request, reply) => {
    const { refresh_token } = request.body;
    const data = await authService.refreshSession(refresh_token);
    return reply.status(200).send({
      access_token: data.session?.access_token,
      refresh_token: data.session?.refresh_token,
      expires_in: data.session?.expires_in,
      user: data.user,
    });
  });

  server.post('/logout', {
    preHandler: [authMiddleware],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const token = request.headers.authorization!.slice(7);
    await authService.signOut(token);
    return reply.status(200).send({ message: 'Sessao encerrada com sucesso' });
  });
}
