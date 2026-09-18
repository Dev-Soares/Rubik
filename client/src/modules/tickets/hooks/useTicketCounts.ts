import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';
import { TICKETS_QUERY_KEY } from '@/modules/tickets/hooks/useTickets';
import { getTicketCountsService } from '@/modules/tickets/service/ticketService';

export function ticketCountsQueryOptions() {
	return queryOptions({
		// Sob o mesmo prefixo da lista: abrir um chamado invalida
		// `['tickets']` e o contador acompanha sem invalidação própria.
		queryKey: [...TICKETS_QUERY_KEY, 'counts'],
		queryFn: getTicketCountsService,
	});
}

export function useTicketCounts() {
	return useSuspenseQuery(ticketCountsQueryOptions());
}
