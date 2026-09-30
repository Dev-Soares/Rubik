import { queryOptions, useQuery } from '@tanstack/react-query';
import { TICKETS_QUERY_KEY } from '@/modules/tickets/hooks/useTickets';
import { getUnseenResolvedService } from '@/modules/tickets/service/ticketService';

/** Mesmo intervalo do sino: curto o bastante para o aviso parecer imediato. */
const REFETCH_MS = 30_000;

export function unseenResolvedQueryOptions() {
	return queryOptions({
		queryKey: [...TICKETS_QUERY_KEY, 'unseen-resolved'],
		queryFn: getUnseenResolvedService,
		refetchInterval: REFETCH_MS,
	});
}

/**
 * Contador do aviso na barra lateral. `useQuery` e não a variante suspense: a
 * sidebar fica no layout e não deve suspender a aplicação inteira.
 *
 * `enabled` porque a rota é restrita a administradores: sem ele, o refetch
 * periódico viraria um 403 a cada 30 segundos para todo usuário comum.
 */
export function useUnseenResolved(enabled = true) {
	return useQuery({ ...unseenResolvedQueryOptions(), enabled });
}
