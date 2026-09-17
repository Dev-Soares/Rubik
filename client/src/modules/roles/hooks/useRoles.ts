import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';
import { listRolesService } from '@/modules/roles/service/roleService';

const DEFAULT_LIMIT = 20;

export function rolesQueryOptions(page = 0, limit = DEFAULT_LIMIT) {
	return queryOptions({
		queryKey: ['roles', { page, limit }],
		queryFn: () => listRolesService({ limit, offset: page * limit }),
	});
}

export function useRoles(page = 0, limit = DEFAULT_LIMIT) {
	return useSuspenseQuery(rolesQueryOptions(page, limit));
}
