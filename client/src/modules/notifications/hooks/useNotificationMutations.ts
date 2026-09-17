import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getErrorMessage } from '@/api/axios';
import {
	markAllNotificationsReadService,
	markNotificationReadService,
} from '@/modules/notifications/service/notificationService';
import { NOTIFICATIONS_QUERY_KEY } from '@/modules/notifications/hooks/useNotifications';

/**
 * Toda mutação invalida pelo prefixo comum: a lista e o contador do sino
 * mudam juntos, e invalidar só uma delas deixa o badge desencontrado da tela.
 */
function useInvalidateNotifications() {
	const queryClient = useQueryClient();
	return () => queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
}

/**
 * Marcar como lida é ação de rotina, disparada ao abrir o item — acerto não
 * rende toast, só o silêncio do badge baixando.
 */
export function useMarkNotificationRead() {
	const invalidate = useInvalidateNotifications();

	return useMutation({
		mutationFn: (id: string) => markNotificationReadService(id),
		onSuccess: () => invalidate(),
		onError: (error) => toast.error(getErrorMessage(error)),
	});
}

export function useMarkAllNotificationsRead() {
	const invalidate = useInvalidateNotifications();

	return useMutation({
		mutationFn: () => markAllNotificationsReadService(),
		onSuccess: async ({ marked }) => {
			await invalidate();
			toast.success(
				marked === 1 ? '1 notificação marcada como lida.' : `${marked} notificações marcadas como lidas.`,
			);
		},
		onError: (error) => toast.error(getErrorMessage(error)),
	});
}
