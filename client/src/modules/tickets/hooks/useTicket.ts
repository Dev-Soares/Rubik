import { queryOptions, useQuery } from '@tanstack/react-query';
import { TICKETS_QUERY_KEY } from '@/modules/tickets/hooks/useTickets';
import { getTicketService } from '@/modules/tickets/service/ticketService';

export function ticketQueryOptions(id: string) {
	return queryOptions({
		queryKey: [...TICKETS_QUERY_KEY, 'detail', id],
		queryFn: () => getTicketService(id),
	});
}

/**
 * Um chamado pelo id, usado quando a tela abre por `?ticket=<id>`. `enabled`
 * cobre a ausência do parâmetro — sem ele o hook chamaria a API com id vazio.
 * `useQuery` e não a variante suspense: o destaque é secundário e não deve
 * segurar a lista.
 */
export function useTicket(id: string | undefined) {
	return useQuery({ ...ticketQueryOptions(id ?? ''), enabled: Boolean(id) });
}
