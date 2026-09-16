import { QueryClient } from '@tanstack/react-query';

const STALE_TIME_MS = 1000 * 60;

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: STALE_TIME_MS,
			retry: 1,
			refetchOnWindowFocus: false,
		},
	},
});
