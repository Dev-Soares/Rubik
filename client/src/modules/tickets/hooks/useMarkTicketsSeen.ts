import { useMutation, useQueryClient } from '@tanstack/react-query';
import { TICKETS_QUERY_KEY } from '@/modules/tickets/hooks/useTickets';
import { markTicketsSeenService } from '@/modules/tickets/service/ticketService';

/**
 * Zera o aviso da barra lateral. Sem toast: é efeito de abrir a tela, não uma
 * ação que o usuário pediu e precise confirmar.
 */
export function useMarkTicketsSeen() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: markTicketsSeenService,
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: TICKETS_QUERY_KEY });
		},
	});
}
