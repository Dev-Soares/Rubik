import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getErrorMessage } from '@/api/axios';
import { TICKETS_QUERY_KEY } from '@/modules/tickets/hooks/useTickets';
import {
	getTicketNotificationService,
	setTicketNotificationService,
} from '@/modules/tickets/service/ticketService';

const NOTIFICATION_QUERY_KEY = [...TICKETS_QUERY_KEY, 'notification-preference'] as const;

export function ticketNotificationQueryOptions() {
	return queryOptions({
		queryKey: NOTIFICATION_QUERY_KEY,
		queryFn: getTicketNotificationService,
	});
}

/**
 * Se o usuário recebe avisos de chamado. `useQuery` e não a variante suspense:
 * é um controle secundário da tela e não deve segurar a lista.
 */
export function useTicketNotification() {
	return useQuery(ticketNotificationQueryOptions());
}

/** Liga e desliga os avisos de chamado do usuário. */
export function useSetTicketNotification() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: setTicketNotificationService,
		onSuccess: async ({ enabled }) => {
			await queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEY });
			toast.success(enabled ? 'Avisos de chamado ligados.' : 'Avisos de chamado desligados.');
		},
		onError: (error) => toast.error(getErrorMessage(error)),
	});
}
