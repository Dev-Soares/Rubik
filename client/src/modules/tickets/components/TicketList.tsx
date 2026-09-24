import { TicketsTable } from '@/modules/tickets/components/TicketsTable';
import { useTickets } from '@/modules/tickets/hooks/useTickets';
import type { TicketStatus } from '@/modules/tickets/types/ticket';
import { formatTicketCount } from '@/modules/tickets/utils';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { useInfiniteScroll } from '@/shared/hooks/useInfiniteScroll';

type TicketListProps = {
	status: TicketStatus;
	/** Chamado apontado pela notificação, destacado na lista. */
	highlightedId?: string;
};

export function TicketList({ status, highlightedId }: TicketListProps) {
	const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useTickets(status);

	const sentinelRef = useInfiniteScroll({
		hasMore: hasNextPage,
		isLoading: isFetchingNextPage,
		onLoadMore: () => void fetchNextPage(),
	});

	const tickets = data.pages.flatMap((page) => page.items);
	const total = data.pages[0]?.total ?? 0;

	if (tickets.length === 0) {
		return (
			<p className="text-muted-foreground py-8 text-center text-sm">
				{status === 'resolvido'
					? 'Nenhum chamado resolvido ainda.'
					: 'Nenhum chamado aberto. Use "Nos envie seu problema" para abrir o primeiro.'}
			</p>
		);
	}

	return (
		<div className="flex flex-col gap-4">
			<TicketsTable tickets={tickets} highlightedId={highlightedId} />

			{/* Sentinela: entrar na tela dispara a próxima página. */}
			<div ref={sentinelRef} aria-hidden />

			{isFetchingNextPage ? (
				<div role="status" aria-label="Carregando mais chamados">
					<Skeleton className="h-24 w-full rounded-lg" />
				</div>
			) : null}

			<p className="text-muted-foreground text-sm">
				{hasNextPage
					? `${tickets.length} de ${total} chamados`
					: formatTicketCount(total, status)}
			</p>
		</div>
	);
}
