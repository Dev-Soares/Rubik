import { authClient, createUserWithRoles } from '@/api/auth-client';
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
	UserStatus,
} from '@/modules/users/types/user';
import { toRoleCsv } from '@/shared/utils/roles';

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
	const { roles, ...rest } = input;
	const { error } = await createUserWithRoles({ ...rest, role: roles });
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
	/** Ausente traz ativos e inativos juntos. */
	status?: UserStatus;
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
	// `user.role` é CSV na API; o formulário trabalha com a lista.
	const body =
		'roles' in input ? { name: input.name, role: toRoleCsv(input.roles) } : input;

	const { data } = await api.patch<User>(`/users/${id}`, body);
	return data;
}

/**
 * Inativa a conta: o Better Auth marca `banned`, recusa o login e encerra as
 * sessões abertas da pessoa. Como `setUserPassword`, exige a role `admin`.
 */
export async function banUserService(id: string): Promise<void> {
	const { error } = await authClient.admin.banUser({ userId: id });

	if (error) {
		throw new Error(translateAuthError(error));
	}
}

export async function unbanUserService(id: string): Promise<void> {
	const { error } = await authClient.admin.unbanUser({ userId: id });

	if (error) {
		throw new Error(translateAuthError(error));
	}
}
