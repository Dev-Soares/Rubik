import { keepPreviousData, queryOptions, useSuspenseQuery } from '@tanstack/react-query';
import { listUsersService } from '@/modules/users/service/userService';
import type { UserStatus } from '@/modules/users/types/user';

const DEFAULT_LIMIT = 20;

export function usersQueryOptions(
	page = 0,
	limit = DEFAULT_LIMIT,
	status?: UserStatus,
) {
	return queryOptions({
		queryKey: ['users', { page, limit, status }],
		queryFn: () => listUsersService({ limit, offset: page * limit, status }),
		/*
		 * Trocar de página muda a `queryKey`, e sem isto a query volta a não ter
		 * dado: o `useSuspenseQuery` suspende, o Suspense da página desmonta a
		 * tabela inteira e mostra o skeleton outra vez. A cada clique em
		 * "Próxima" a lista piscava e o scroll ia para o topo.
		 *
		 * Com `keepPreviousData` a página anterior fica na tela enquanto a nova
		 * carrega; quem sinaliza a troca é o `isPlaceholderData` no painel.
		 */
		placeholderData: keepPreviousData,
	});
}

export function useUsers(page = 0, limit = DEFAULT_LIMIT, status?: UserStatus) {
	return useSuspenseQuery(usersQueryOptions(page, limit, status));
}
