/** `admin` é o cargo de sistema com acesso total; o seed garante que ele exista. */
export const ADMIN_ROLE = 'admin';

/** `user.role` guarda nomes separados por vírgula — o Better Auth grava assim. */
export function toRoleNames(roleNames: string | null | undefined): string[] {
	return (
		roleNames
			?.split(',')
			.map((name) => name.trim())
			.filter(Boolean) ?? []
	);
}

export function isAdmin(roleNames: string | null | undefined): boolean {
	return toRoleNames(roleNames).includes(ADMIN_ROLE);
}
