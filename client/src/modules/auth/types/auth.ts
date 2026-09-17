import { z } from 'zod';

export const signInSchema = z.object({
	email: z.email('E-mail inválido.'),
	password: z.string().min(8, 'A senha deve ter no mínimo 8 caracteres.'),
});

export type SignInInput = z.infer<typeof signInSchema>;
