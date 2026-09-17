import { queryOptions, useQuery } from '@tanstack/react-query';
import { listMyScreensService } from '@/modules/roles/service/roleService';
import type { Screen, ScreenLevel } from '@/modules/roles/types/role';
import { toPermission } from '@/modules/roles/utils';

const SCREENS_STALE_TIME_MS = 1000 * 60;

export const myScreensQueryOptions = queryOptions({
	queryKey: ['roles', 'me', 'screens'],
	queryFn: listMyScreensService,
	staleTime: SCREENS_STALE_TIME_MS,
});

/**
 * Permissões do usuário. `useQuery` (e não suspense) de propósito: a sidebar não
 * deve suspender o layout inteiro esperando permissão.
 *
 * `can` é só UX — quem autoriza de verdade é o `ScreensGuard` do backend.
 */
export function useMyScreens() {
	const { data, isPending } = useQuery(myScreensQueryOptions);
	const screens = data ?? [];

	return {
		screens,
		isPending,
		can: (screen: Screen, level: ScreenLevel = 'read') =>
			screens.includes(toPermission(screen, level)),
	};
}
