/** Espelha `ADMIN_ROLE` do backend (`server/src/common/utils/roles.utils.ts`). */
export const ADMIN_ROLE = 'admin';

/** `user.role` guarda nomes separados por vírgula — o Better Auth grava assim. */
export function toRoleNames(role: string | null | undefined): string[] {
	return (
		role
			?.split(',')
			.map((name) => name.trim())
			.filter(Boolean) ?? []
	);
}

export function isAdminRole(role: string | null | undefined): boolean {
	return toRoleNames(role).includes(ADMIN_ROLE);
}
