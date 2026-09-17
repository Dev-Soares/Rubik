import { NotificationItem } from '@/modules/notifications/components/NotificationItem';
import { useMarkNotificationRead } from '@/modules/notifications/hooks/useNotificationMutations';
import { useNotifications } from '@/modules/notifications/hooks/useNotifications';
import type {
	NotificationEntry,
	NotificationFilters,
} from '@/modules/notifications/types/notification';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { useInfiniteScroll } from '@/shared/hooks/useInfiniteScroll';

type NotificationListProps = {
	filters: NotificationFilters;
};

export function NotificationList({ filters }: NotificationListProps) {
	const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useNotifications(filters);
	const markRead = useMarkNotificationRead();

	const sentinelRef = useInfiniteScroll({
		hasMore: hasNextPage,
		isLoading: isFetchingNextPage,
		onLoadMore: () => void fetchNextPage(),
	});

	const notifications = data.pages.flatMap((page) => page.items);
	const total = data.pages[0]?.total ?? 0;

	/** Abrir uma já lida não gera requisição — o estado final seria o mesmo. */
	function handleOpen(notification: NotificationEntry) {
		if (notification.readAt === null) {
			markRead.mutate(notification.id);
		}
	}

	if (notifications.length === 0) {
		return (
			<p className="text-muted-foreground py-8 text-center text-sm">
				{filters.unreadOnly ? 'Nenhuma notificação não lida.' : 'Nenhuma notificação por aqui.'}
			</p>
		);
	}

	return (
		<div className="flex flex-col gap-4">
			<ul className="flex flex-col">
				{notifications.map((notification) => (
					<NotificationItem
						key={notification.id}
						notification={notification}
						onOpen={handleOpen}
						onMarkRead={(id) => markRead.mutate(id)}
					/>
				))}
			</ul>

			{/* Sentinela: entrar na tela dispara a próxima página. */}
			<div ref={sentinelRef} aria-hidden />

			{isFetchingNextPage ? (
				<div role="status" aria-label="Carregando mais notificações" className="flex gap-3 px-3">
					<Skeleton className="mt-1.5 size-2 shrink-0 rounded-full" />
					<div className="flex flex-1 flex-col gap-2">
						<Skeleton className="h-4 w-48" />
						<Skeleton className="h-3 w-64" />
					</div>
				</div>
			) : null}

			<p className="text-muted-foreground px-3 text-sm">
				{hasNextPage
					? `${notifications.length} de ${total} notificações`
					: `${total} ${total === 1 ? 'notificação' : 'notificações'}`}
			</p>
		</div>
	);
}
