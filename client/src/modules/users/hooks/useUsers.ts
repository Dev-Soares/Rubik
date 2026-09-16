import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';
import { listUsersService } from '@/modules/users/service/userService';

const DEFAULT_LIMIT = 20;

export function usersQueryOptions(page = 0, limit = DEFAULT_LIMIT) {
	return queryOptions({
		queryKey: ['users', { page, limit }],
		queryFn: () => listUsersService({ limit, offset: page * limit }),
	});
}

export function useUsers(page = 0, limit = DEFAULT_LIMIT) {
	return useSuspenseQuery(usersQueryOptions(page, limit));
}
