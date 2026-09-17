import { adminClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
	baseURL: import.meta.env.VITE_API_URL,
	basePath: '/auth',
	plugins: [adminClient()],
});

// Cadastro público está desativado no servidor; usuários são criados por um
// admin via `authClient.admin.createUser`.
export const { signIn, signOut, useSession, getSession } = authClient;
