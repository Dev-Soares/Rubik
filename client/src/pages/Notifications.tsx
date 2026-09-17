import { NotificationPanel } from '@/modules/notifications/components/NotificationPanel';
import { PageHeader } from '@/shared/components/PageHeader';
import { AppLayout } from '@/shared/layouts/AppLayout';

export function Notifications() {
	return (
		<AppLayout>
			<div className="flex flex-col gap-8">
				<PageHeader
					title="Notificações"
					description="Os avisos destinados a você, do mais recente para o mais antigo."
				/>

				<NotificationPanel />
			</div>
		</AppLayout>
	);
}
