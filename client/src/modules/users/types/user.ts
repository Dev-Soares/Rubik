import { z } from 'zod';

export const updateUserSchema = z.object({
	name: z
		.string()
		.min(2, 'O nome deve ter no mínimo 2 caracteres.')
		.max(100, 'O nome deve ter no máximo 100 caracteres.'),
});

export const changePasswordSchema = z
	.object({
		currentPassword: z.string().min(1, 'Informe a senha atual.'),
		newPassword: z.string().min(8, 'A nova senha deve ter no mínimo 8 caracteres.'),
		confirmPassword: z.string(),
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		message: 'As senhas não conferem.',
		path: ['confirmPassword'],
	});

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export const createUserSchema = z.object({
	name: z
		.string()
		.min(2, 'O nome deve ter no mínimo 2 caracteres.')
		.max(100, 'O nome deve ter no máximo 100 caracteres.'),
	email: z.email('E-mail inválido.'),
	password: z.string().min(8, 'A senha deve ter no mínimo 8 caracteres.'),
	role: z.enum(['user', 'admin']),
});

/** Edição feita pela tela de administração: o cargo entra junto do nome. */
export const editUserSchema = updateUserSchema.extend({
	role: z.string().min(1, 'Escolha um cargo.'),
});

/**
 * Senha definida por um administrador: sem a senha atual, e com confirmação
 * para evitar erro de digitação em algo que o dono da conta não escolheu.
 */
export const setUserPasswordSchema = z
	.object({
		newPassword: z.string().min(8, 'A senha deve ter no mínimo 8 caracteres.'),
		confirmPassword: z.string(),
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		message: 'As senhas não conferem.',
		path: ['confirmPassword'],
	});

export type SetUserPasswordFormInput = z.infer<typeof setUserPasswordSchema>;

export type SetUserPasswordInput = {
	userId: string;
	newPassword: string;
};

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type EditUserInput = z.infer<typeof editUserSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;

export type User = {
	id: string;
	name: string;
	email: string;
	emailVerified: boolean;
	image: string | null;
	role: string | null;
	createdAt: string;
	updatedAt: string;
};

export type PaginatedUsers = {
	items: User[];
	total: number;
	limit: number;
	offset: number;
};
