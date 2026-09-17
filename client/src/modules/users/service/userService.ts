import { authClient } from '@/api/auth-client';
import { api } from '@/api/axios';
import { translateAuthError } from '@/modules/auth/types/errors';
import type {
	ChangePasswordInput,
	CreateUserInput,
	EditUserInput,
	PaginatedUsers,
	SetUserPasswordInput,
	UpdateUserInput,
	User,
} from '@/modules/users/types/user';

/** Troca a senha do próprio usuário, exigindo a senha atual. */
export async function changePasswordService(input: ChangePasswordInput): Promise<void> {
	const { error } = await authClient.changePassword({
		currentPassword: input.currentPassword,
		newPassword: input.newPassword,
		revokeOtherSessions: true,
	});

	if (error) {
		throw new Error(translateAuthError(error));
	}
}

/** Criação de usuário é exclusiva de admin (cadastro público está desativado). */
export async function createUserService(input: CreateUserInput): Promise<void> {
	const { error } = await authClient.admin.createUser(input);
	if (error) {
		throw new Error(translateAuthError(error));
	}
}

/**
 * Define a senha de outro usuário, sem pedir a atual. O Better Auth exige role
 * `admin` aqui — a permissão de tela não substitui isso.
 */
export async function setUserPasswordService(input: SetUserPasswordInput): Promise<void> {
	const { error } = await authClient.admin.setUserPassword({
		userId: input.userId,
		newPassword: input.newPassword,
	});

	if (error) {
		throw new Error(translateAuthError(error));
	}
}

export async function listUsersService(params: {
	limit: number;
	offset: number;
}): Promise<PaginatedUsers> {
	const { data } = await api.get<PaginatedUsers>('/users', { params });
	return data;
}

export async function findUserService(id: string): Promise<User> {
	const { data } = await api.get<User>(`/users/${id}`);
	return data;
}

export async function updateUserService(
	id: string,
	input: UpdateUserInput | EditUserInput,
): Promise<User> {
	const { data } = await api.patch<User>(`/users/${id}`, input);
	return data;
}

export async function deleteUserService(id: string): Promise<void> {
	await api.delete(`/users/${id}`);
}
