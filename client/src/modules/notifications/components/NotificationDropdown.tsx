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
		<div
			className="bg-popover text-popover-foreground absolute right-0 z-50 mt-2 flex w-[min(22rem,calc(100vw-2rem))] flex-col rounded-md border shadow-md"
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
