import { TicketCallout } from '@/modules/tickets/components/TicketCallout';
import { TicketPanel } from '@/modules/tickets/components/TicketPanel';
import { PageHeader } from '@/shared/components/PageHeader';
import { AppLayout } from '@/shared/layouts/AppLayout';

export function Tickets() {
	return (
		/* Duas colunas de chamados não cabem na largura de leitura padrão. */
		<AppLayout className="max-w-5xl">
			<div className="flex flex-col gap-10">
				<PageHeader title="Solicitar ajuda" />

				<TicketCallout />

				<TicketPanel />
			</div>
		</AppLayout>
	);
}
