import { queryOptions, useQuery } from '@tanstack/react-query';
import { listMyPermissionsService } from '@/modules/roles/service/roleService';
import type { Action, Module } from '@/modules/roles/types/role';
import { toPermission } from '@/modules/roles/utils';

const PERMISSIONS_STALE_TIME_MS = 1000 * 60;

export const myPermissionsQueryOptions = queryOptions({
	queryKey: ['roles', 'me', 'permissions'],
	queryFn: listMyPermissionsService,
	staleTime: PERMISSIONS_STALE_TIME_MS,
});

/**
 * Permissões do usuário. `useQuery` (e não suspense) de propósito: a sidebar não
 * deve suspender o layout inteiro esperando permissão.
 *
 * `can` é só UX — quem autoriza de verdade é o `AccessGuard` do backend.
 */
export function useMyPermissions() {
	const { data, isPending } = useQuery(myPermissionsQueryOptions);
	const permissions = data ?? [];

	return {
		permissions,
		isPending,
		can: <M extends Module>(module: M, action: Action<M> = 'ver' as Action<M>) =>
			permissions.includes(toPermission(module, action)),
	};
}
