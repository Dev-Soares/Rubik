import { z } from 'zod';

export const signInSchema = z.object({
	email: z.email('E-mail inválido.'),
	password: z.string().min(8, 'A senha deve ter no mínimo 8 caracteres.'),
});

export const signUpSchema = z
	.object({
		name: z.string().min(2, 'O nome deve ter no mínimo 2 caracteres.'),
		email: z.email('E-mail inválido.'),
		password: z.string().min(8, 'A senha deve ter no mínimo 8 caracteres.'),
		confirmPassword: z.string(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: 'As senhas não conferem.',
		path: ['confirmPassword'],
	});

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
