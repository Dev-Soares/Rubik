import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';
import { getSession } from '@/api/auth-client';
import type { Session } from '@/shared/types/auth';

const SESSION_STALE_TIME_MS = 1000 * 30;

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
		isAdmin: session?.user.role?.split(',').includes('admin') ?? false,
	};
}
