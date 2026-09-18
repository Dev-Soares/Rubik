import { Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { NotificationItem } from '@/modules/notifications/components/NotificationItem';
import {
	useMarkAllNotificationsRead,
	useMarkNotificationRead,
} from '@/modules/notifications/hooks/useNotificationMutations';
import { notificationPreviewQueryOptions } from '@/modules/notifications/hooks/useNotifications';
import { NotificationListSkeleton } from '@/modules/notifications/skeletons/NotificationListSkeleton';
import type { NotificationEntry } from '@/modules/notifications/types/notification';
import { Button } from '@/shared/components/ui/button';

type NotificationDropdownProps = {
	onClose: () => void;
};

/** O painel é um resumo; a lista completa fica na página. */
const PREVIEW_SIZE = 6;

export function NotificationDropdown({ onClose }: NotificationDropdownProps) {
	// `useQuery` e não a variante suspense: o painel abre com o próprio
	// esqueleto, sem suspender a barra de navegação em volta dele.
	const { data, isPending } = useQuery(notificationPreviewQueryOptions(PREVIEW_SIZE));
	const markRead = useMarkNotificationRead();
	const markAllRead = useMarkAllNotificationsRead();

	const notifications = data?.items ?? [];
	const hasUnread = notifications.some((item) => item.readAt === null);

	function handleOpen(notification: NotificationEntry) {
		if (notification.readAt === null) {
			markRead.mutate(notification.id);
		}
		onClose();
	}

	return (
		/*
		 * `fixed` em vez de `absolute`: ancorado ao elemento, a largura dependia
		 * do container ter sido contido corretamente, e qualquer ancestral que
		 * transbordasse levava o painel junto — era o que cortava o cabeçalho no
		 * celular. Preso à viewport, `inset-x-2` garante a margem dos dois lados
		 * e `ml-auto` mantém o painel encostado à direita, sob o sino.
		 */
		<div
			className="bg-popover text-popover-foreground fixed inset-x-2 top-15 z-50 ml-auto flex max-w-88 flex-col rounded-md border shadow-md sm:absolute sm:inset-x-auto sm:top-auto sm:right-0 sm:mt-2 sm:w-88"
			role="dialog"
			aria-label="Notificações"
		>
			<div className="flex items-center justify-between border-b px-3 py-2">
				<span className="text-sm font-semibold">Notificações</span>

				{hasUnread ? (
					<Button
						type="button"
						variant="ghost"
						size="sm"
						disabled={markAllRead.isPending}
						onClick={() => markAllRead.mutate()}
					>
						Marcar todas
					</Button>
				) : null}
			</div>

			{/* Teto de altura: com muitos itens o painel passaria da dobra. */}
			<div className="max-h-96 overflow-y-auto p-1">
				{isPending ? (
					<NotificationListSkeleton items={3} />
				) : notifications.length === 0 ? (
					<p className="text-muted-foreground py-6 text-center text-sm">
						Nenhuma notificação por aqui.
					</p>
				) : (
					<ul className="flex flex-col">
						{notifications.map((notification) => (
							<NotificationItem
								key={notification.id}
								notification={notification}
								onOpen={handleOpen}
								compact
							/>
						))}
					</ul>
				)}
			</div>

			<div className="border-t p-1">
				<Button asChild variant="ghost" size="sm" className="w-full">
					<Link to="/notifications" onClick={onClose}>
						Ver todas
					</Link>
				</Button>
			</div>
		</div>
	);
}
