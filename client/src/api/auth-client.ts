import { adminClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
	baseURL: import.meta.env.VITE_API_URL,
	basePath: '/auth',
	plugins: [adminClient()],
});

// Cadastro público está desativado no servidor; usuários são criados por um
// admin via `createUserWithRoles`.
export const { signIn, signOut, useSession, getSession } = authClient;

type CreateUserWithRoles = (input: {
	name: string;
	email: string;
	password: string;
	/** Nomes de cargos da tabela `role`; o Better Auth grava a lista como CSV. */
	role: string[];
}) => ReturnType<typeof authClient.admin.createUser>;

/**
 * `adminClient()` não recebe a lista de cargos, então tipa `role` como
 * `'user' | 'admin'` — o default do plugin, não o domínio daqui, onde cargo é
 * uma linha da tabela `role`. O runtime aceita qualquer nome; só o tipo é
 * estreito, e este é o único ponto que o alarga.
 */
export const createUserWithRoles = authClient.admin.createUser as CreateUserWithRoles;
