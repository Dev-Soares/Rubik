import { NotificationPanel } from '@/modules/notifications/components/NotificationPanel';
import { PageHeader } from '@/shared/components/PageHeader';
import { PageWidth } from '@/shared/components/PageWidth';

export function Notifications() {
	return (
		<PageWidth>
			<div className="flex flex-col gap-8">
				<PageHeader
					title="Notificações"
					description="Os avisos destinados a você, do mais recente para o mais antigo."
				/>

				<NotificationPanel />
			</div>
		</PageWidth>
	);
}
