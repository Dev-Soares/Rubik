import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';
import { findUserScreensService } from '@/modules/roles/service/roleService';

export function userScreensQueryOptions(userId: string) {
	return queryOptions({
		queryKey: ['roles', 'users', userId, 'screens'],
		queryFn: () => findUserScreensService(userId),
	});
}

export function useUserScreens(userId: string) {
	return useSuspenseQuery(userScreensQueryOptions(userId));
}
