import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';
import { getSession } from '@/api/auth-client';
import type { Session } from '@/shared/types/auth';
import { isAdminRole } from '@/shared/utils/roles';

/**
 * A sessão é `await`ada no `beforeLoad` do `_auth`, ANTES do loader de toda
 * página — então cada expiração entra como ida ao servidor extra, em série, na
 * frente da navegação. Com os 30s de antes isso acontecia duas vezes por minuto
 * de uso.
 *
 * Alongar não afrouxa a proteção: sessão derrubada no servidor volta 401 na
 * primeira requisição da tela, e o interceptor em `api/axios.ts` redireciona
 * para o login. O cache só decide quando revalidar por conta própria.
 */
const SESSION_STALE_TIME_MS = 1000 * 60 * 5;

export const sessionQueryOptions = queryOptions({
	queryKey: ['session'],
	queryFn: async (): Promise<Session | null> => {
		const { data } = await getSession();
		return data ?? null;
	},
	staleTime: SESSION_STALE_TIME_MS,
});

/** Lê a sessão do cache. Usar em rotas que já a pré-carregaram no beforeLoad. */
export function useAuth() {
	const { data: session } = useSuspenseQuery(sessionQueryOptions);

	return {
		session,
		user: session?.user ?? null,
		isAuthenticated: Boolean(session),
		isAdmin: isAdminRole(session?.user.role),
	};
}
