import { z } from 'zod';

export const updateUserSchema = z.object({
	name: z
		.string()
		.min(2, 'O nome deve ter no mínimo 2 caracteres.')
		.max(100, 'O nome deve ter no máximo 100 caracteres.'),
	image: z.union([z.url('Informe uma URL válida.'), z.literal('')]).optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;

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
