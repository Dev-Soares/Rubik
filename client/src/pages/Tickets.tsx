import { TicketCallout } from '@/modules/tickets/components/TicketCallout';
import { TicketPanel } from '@/modules/tickets/components/TicketPanel';
import { PageHeader } from '@/shared/components/PageHeader';
import { AppLayout } from '@/shared/layouts/AppLayout';

export function Tickets() {
	return (
		/* A tabela de chamados tem quatro colunas: na largura de leitura padrão o
		 * assunto ficaria truncado cedo demais. */
		<AppLayout className="max-w-5xl">
			<div className="flex flex-col gap-10">
				<PageHeader title="Solicitar ajuda" />

				<TicketCallout />

				<TicketPanel />
			</div>
		</AppLayout>
	);
}
