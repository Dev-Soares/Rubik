import { TicketCallout } from '@/modules/tickets/components/TicketCallout';
import { TicketPanel } from '@/modules/tickets/components/TicketPanel';
import { PageHeader } from '@/shared/components/PageHeader';
import { PageWidth } from '@/shared/components/PageWidth';

export function Tickets() {
	return (
		/* A tabela de chamados tem quatro colunas: na largura de leitura padrão o
		 * assunto ficaria truncado cedo demais. */
		<PageWidth className="max-w-5xl">
			<div className="flex flex-col gap-10">
				<PageHeader title="Suporte" description="Acompanhe e abra chamados de suporte." />

				<TicketCallout />

				<TicketPanel />
			</div>
		</PageWidth>
	);
}
