import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getErrorMessage } from '@/api/axios';
import { createTicketService } from '@/modules/tickets/service/ticketService';
import { TICKETS_QUERY_KEY } from '@/modules/tickets/hooks/useTickets';
import type { TicketFormInput } from '@/modules/tickets/types/ticket';

/**
 * Erro de submit aparece inline no formulário (`error`), não como toast. A
 * mensagem é normalizada aqui: crua, o axios entregaria o texto em inglês em
 * vez do pt-BR que a API devolve no corpo.
 */
export function useCreateTicket(onCreated?: () => void) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (input: TicketFormInput) => {
			try {
				return await createTicketService(input);
			} catch (error) {
				throw new Error(getErrorMessage(error));
			}
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: TICKETS_QUERY_KEY });
			toast.success('Chamado aberto.');
			onCreated?.();
		},
	});
}
