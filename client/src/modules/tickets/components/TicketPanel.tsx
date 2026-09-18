import { useSearch } from '@tanstack/react-router';
import { Suspense, useEffect, useState } from 'react';
import { TicketList } from '@/modules/tickets/components/TicketList';
import { TicketStatusTabs } from '@/modules/tickets/components/TicketStatusTabs';
import { useMarkTicketsSeen } from '@/modules/tickets/hooks/useMarkTicketsSeen';
import { useTicket } from '@/modules/tickets/hooks/useTicket';
import { useTicketCounts } from '@/modules/tickets/hooks/useTicketCounts';
import { useUnseenResolved } from '@/modules/tickets/hooks/useUnseenResolved';
import { TicketListSkeleton } from '@/modules/tickets/skeletons/TicketListSkeleton';
import type { TicketStatus } from '@/modules/tickets/types/ticket';
import { isTicketStatus } from '@/modules/tickets/utils';

export function TicketPanel() {
	const { ticket: highlightedId } = useSearch({ from: '/_auth/tickets' });
	const [status, setStatus] = useState<TicketStatus>('aberto');
	const { data: counts } = useTicketCounts();
	const { data: highlighted } = useTicket(highlightedId);
	const { data: unseen } = useUnseenResolved();
	const { mutate: markSeen } = useMarkTicketsSeen();

	const unseenCount = unseen?.count ?? 0;

	/*
	 * Abrir a tela é o que marca a resolução como vista — daí o efeito, e não um
	 * botão. A guarda pelo contador evita a chamada quando não há nada a zerar;
	 * `markSeen` vem do `useMutation`, cuja identidade é estável.
	 */
	useEffect(() => {
		if (unseenCount > 0) {
			markSeen();
		}
	}, [unseenCount, markSeen]);

	/*
	 * Abre na aba do chamado apontado pela notificação: um resolvido não
	 * apareceria na aba "Abertos", que é o padrão. Depende do status carregado,
	 * então roda uma vez por chamado — trocar de aba na mão continua valendo.
	 */
	const highlightedStatus = highlighted?.status;

	useEffect(() => {
		if (highlightedStatus && isTicketStatus(highlightedStatus)) {
			setStatus(highlightedStatus);
		}
	}, [highlightedStatus]);

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-col gap-3">
				<h2 className="text-lg font-bold tracking-tight">Chamados</h2>

				<TicketStatusTabs value={status} counts={counts} onChange={setStatus} />
			</div>

			{/*
			 * A chave remonta a lista ao trocar de filtro: sem ela o
			 * `useSuspenseInfiniteQuery` manteria as páginas já carregadas do
			 * status anterior enquanto o novo resultado chega.
			 */}
			<div role="tabpanel" aria-labelledby={`ticket-tab-${status}`}>
				<Suspense fallback={<TicketListSkeleton />}>
					<TicketList key={status} status={status} highlightedId={highlightedId} />
				</Suspense>
			</div>
		</div>
	);
}
