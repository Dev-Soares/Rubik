import { Suspense, useState } from 'react';
import { NotificationList } from '@/modules/notifications/components/NotificationList';
import { useMarkAllNotificationsRead } from '@/modules/notifications/hooks/useNotificationMutations';
import { useUnreadCount } from '@/modules/notifications/hooks/useNotifications';
import { NotificationListSkeleton } from '@/modules/notifications/skeletons/NotificationListSkeleton';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';

export function NotificationPanel() {
	const [unreadOnly, setUnreadOnly] = useState(false);
	const { data } = useUnreadCount();
	const markAllRead = useMarkAllNotificationsRead();

	const unreadCount = data?.count ?? 0;

	return (
		<Card>
			<CardContent className="flex flex-col gap-4">
				<div className="flex flex-wrap items-center gap-2">
					<div className="flex gap-1" role="group" aria-label="Filtrar notificações">
						<Button
							type="button"
							variant={unreadOnly ? 'ghost' : 'secondary'}
							size="sm"
							onClick={() => setUnreadOnly(false)}
						>
							Todas
						</Button>
						<Button
							type="button"
							variant={unreadOnly ? 'secondary' : 'ghost'}
							size="sm"
							onClick={() => setUnreadOnly(true)}
						>
							Não lidas{unreadCount > 0 ? ` (${unreadCount})` : ''}
						</Button>
					</div>

					{unreadCount > 0 ? (
						<Button
							type="button"
							variant="outline"
							size="sm"
							className="ml-auto"
							disabled={markAllRead.isPending}
							onClick={() => markAllRead.mutate()}
						>
							Marcar todas como lidas
						</Button>
					) : null}
				</div>

				{/*
				 * A chave remonta a lista ao trocar de aba: sem ela o
				 * `useSuspenseInfiniteQuery` manteria as páginas já carregadas do
				 * filtro anterior enquanto o novo resultado chega.
				 */}
				<Suspense fallback={<NotificationListSkeleton />}>
					<NotificationList
						key={String(unreadOnly)}
						filters={unreadOnly ? { unreadOnly: true } : {}}
					/>
				</Suspense>
			</CardContent>
		</Card>
	);
}
