import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';
import { findUserPermissionsService } from '@/modules/roles/service/roleService';

export function userPermissionsQueryOptions(userId: string) {
	return queryOptions({
		queryKey: ['roles', 'users', userId, 'permissions'],
		queryFn: () => findUserPermissionsService(userId),
	});
}

export function useUserPermissions(userId: string) {
	return useSuspenseQuery(userPermissionsQueryOptions(userId));
}
