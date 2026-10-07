/** Situação da conta, do ponto de vista de quem administra usuários. */
export const USER_STATUSES = ['ativo', 'inativo'] as const;

export type UserStatus = (typeof USER_STATUSES)[number];

export type PublicUser = {
	id: string;
	name: string;
	email: string;
	emailVerified: boolean;
	image: string | null;
	role: string | null;
	/** Conta inativada pelo admin: o Better Auth recusa o login enquanto for `true`. */
	banned: boolean | null;
	createdAt: Date;
	updatedAt: Date;
};
