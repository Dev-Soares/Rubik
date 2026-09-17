import { queryOptions, useQuery } from '@tanstack/react-query';
import { listMyScreensService } from '@/modules/roles/service/roleService';

const SCREENS_STALE_TIME_MS = 1000 * 60;

export const myScreensQueryOptions = queryOptions({
	queryKey: ['roles', 'me', 'screens'],
	queryFn: listMyScreensService,
	staleTime: SCREENS_STALE_TIME_MS,
});

/**
 * Telas liberadas ao usuário. `useQuery` (e não suspense) de propósito: a
 * sidebar não deve suspender o layout inteiro esperando permissão.
 */
export function useMyScreens() {
	const { data, isPending } = useQuery(myScreensQueryOptions);

	return { screens: data ?? [], isPending };
}
