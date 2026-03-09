import { z } from 'zod';

export const signupSchema = z.object({
  email: z.string().email('Email invalido'),
  password: z.string().min(8, 'Senha deve ter no minimo 8 caracteres'),
});

export const loginSchema = z.object({
  email: z.string().email('Email invalido'),
  password: z.string().min(1, 'Senha e obrigatoria'),
});

export const googleAuthSchema = z.object({
  id_token: z.string().min(1, 'id_token e obrigatorio'),
});

export const refreshSchema = z.object({
  refresh_token: z.string().min(1, 'refresh_token e obrigatorio'),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type GoogleAuthInput = z.infer<typeof googleAuthSchema>;
export type RefreshInput = z.infer<typeof refreshSchema>;
