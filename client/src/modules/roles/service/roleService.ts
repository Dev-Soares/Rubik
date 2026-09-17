import { api } from '@/api/axios';
import type {
	PaginatedRoles,
	Role,
	RoleFormInput,
	ScreenOverride,
	ScreenPermission,
	UserScreens,
} from '@/modules/roles/types/role';

/** Permissões do usuário da sessão. */
export async function listMyScreensService(): Promise<ScreenPermission[]> {
	const { data } = await api.get<ScreenPermission[]>('/roles/me/screens');
	return data;
}

/** Permissões de um usuário: herdado do cargo, exceções e efetivo. */
export async function findUserScreensService(userId: string): Promise<UserScreens> {
	const { data } = await api.get<UserScreens>(`/roles/users/${userId}/screens`);
	return data;
}

export async function setUserScreensService(
	userId: string,
	overrides: ScreenOverride[],
): Promise<UserScreens> {
	const { data } = await api.put<UserScreens>(`/roles/users/${userId}/screens`, { overrides });
	return data;
}

export async function listRolesService(params: {
	limit: number;
	offset: number;
}): Promise<PaginatedRoles> {
	const { data } = await api.get<PaginatedRoles>('/roles', { params });
	return data;
}

export async function findRoleService(id: string): Promise<Role> {
	const { data } = await api.get<Role>(`/roles/${id}`);
	return data;
}

export async function createRoleService(input: RoleFormInput): Promise<Role> {
	const { data } = await api.post<Role>('/roles', input);
	return data;
}

export async function updateRoleService(id: string, input: RoleFormInput): Promise<Role> {
	const { data } = await api.patch<Role>(`/roles/${id}`, input);
	return data;
}

export async function deleteRoleService(id: string): Promise<void> {
	await api.delete(`/roles/${id}`);
}
