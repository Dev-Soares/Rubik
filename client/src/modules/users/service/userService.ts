import { api } from '@/api/axios';
import type { PaginatedUsers, UpdateUserInput, User } from '@/modules/users/types/user';

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

export async function updateUserService(id: string, input: UpdateUserInput): Promise<User> {
	const payload = { ...input, image: input.image || undefined };
	const { data } = await api.patch<User>(`/users/${id}`, payload);
	return data;
}

export async function deleteUserService(id: string): Promise<void> {
	await api.delete(`/users/${id}`);
}
