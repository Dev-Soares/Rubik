import {
	infiniteQueryOptions,
	queryOptions,
	useQuery,
	useSuspenseInfiniteQuery,
} from '@tanstack/react-query';
import {
	getUnreadCountService,
	listNotificationsService,
} from '@/modules/notifications/service/notificationService';
import type { NotificationFilters } from '@/modules/notifications/types/notification';
import { nextOffset } from '@/modules/notifications/utils';

const PAGE_SIZE = 20;

/** Intervalo do contador do sino: curto o bastante para parecer imediato. */
const UNREAD_COUNT_REFETCH_MS = 30_000;

/** Prefixo comum às duas queries — invalidar por ele atinge lista e contador. */
export const NOTIFICATIONS_QUERY_KEY = ['notifications'] as const;

export function notificationsQueryOptions(
	filters: NotificationFilters = {},
	limit = PAGE_SIZE,
) {
	return infiniteQueryOptions({
		queryKey: [...NOTIFICATIONS_QUERY_KEY, 'list', { limit, ...filters }],
		queryFn: ({ pageParam }) =>
			listNotificationsService({ limit, offset: pageParam, ...filters }),
		initialPageParam: 0,
		getNextPageParam: nextOffset,
	});
}

/**
 * Primeira página avulsa, para o painel do sino: ele mostra um resumo fixo e
 * não pagina, então não compartilha a chave da lista infinita da página.
 */
export function notificationPreviewQueryOptions(limit: number) {
	return queryOptions({
		queryKey: [...NOTIFICATIONS_QUERY_KEY, 'preview', { limit }],
		queryFn: () => listNotificationsService({ limit, offset: 0 }),
	});
}

export function unreadCountQueryOptions() {
	return queryOptions({
		queryKey: [...NOTIFICATIONS_QUERY_KEY, 'unread-count'],
		queryFn: getUnreadCountService,
		refetchInterval: UNREAD_COUNT_REFETCH_MS,
	});
}

export function useNotifications(filters: NotificationFilters = {}, limit = PAGE_SIZE) {
	return useSuspenseInfiniteQuery(notificationsQueryOptions(filters, limit));
}

/**
 * Contador do sino. `useQuery` e não `useSuspenseQuery`: o sino fica no layout
 * e não deve suspender a aplicação inteira enquanto carrega.
 */
export function useUnreadCount() {
	return useQuery(unreadCountQueryOptions());
}
