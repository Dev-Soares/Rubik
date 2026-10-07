import { api } from '@/api/axios';
import type {
	PaginatedRoles,
	Permission,
	PermissionOverride,
	Role,
	RoleFormInput,
	UserPermissions,
} from '@/modules/roles/types/role';

/** Permissões do usuário da sessão. */
export async function listMyPermissionsService(): Promise<Permission[]> {
	const { data } = await api.get<Permission[]>('/roles/me/permissions');
	return data;
}

/** Permissões de um usuário: herdado do cargo, exceções e efetivo. */
export async function findUserPermissionsService(userId: string): Promise<UserPermissions> {
	const { data } = await api.get<UserPermissions>(`/roles/users/${userId}/permissions`);
	return data;
}

export async function setUserPermissionsService(
	userId: string,
	overrides: PermissionOverride[],
): Promise<UserPermissions> {
	const { data } = await api.put<UserPermissions>(`/roles/users/${userId}/permissions`, {
		overrides,
	});
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
