import { infiniteQueryOptions, useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { listTicketsService } from '@/modules/tickets/service/ticketService';
import type { TicketStatus } from '@/modules/tickets/types/ticket';
import { nextOffset } from '@/modules/tickets/utils';

const PAGE_SIZE = 20;

export const TICKETS_QUERY_KEY = ['tickets'] as const;

export function ticketsQueryOptions(status: TicketStatus, limit = PAGE_SIZE) {
	return infiniteQueryOptions({
		queryKey: [...TICKETS_QUERY_KEY, 'list', { limit, status }],
		queryFn: ({ pageParam }) => listTicketsService({ limit, offset: pageParam, status }),
		initialPageParam: 0,
		getNextPageParam: nextOffset,
	});
}

export function useTickets(status: TicketStatus, limit = PAGE_SIZE) {
	return useSuspenseInfiniteQuery(ticketsQueryOptions(status, limit));
}
