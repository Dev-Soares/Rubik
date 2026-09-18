import { TICKET_STATUSES } from '@/modules/tickets/types/ticket';
import type { TicketCounts, TicketStatus } from '@/modules/tickets/types/ticket';
import { cn } from 'cn';

/** Plural do rótulo: a aba fala do conjunto, o selo do card fala de um item. */
const TAB_LABELS: Record<TicketStatus, string> = {
	aberto: 'Abertos',
	resolvido: 'Resolvidos',
};

type TicketStatusTabsProps = {
	value: TicketStatus;
	counts: TicketCounts;
	onChange: (status: TicketStatus) => void;
};

export function TicketStatusTabs({ value, counts, onChange }: TicketStatusTabsProps) {
	return (
		/* `tablist` em vez de um grupo de botões: são visões alternativas da
		 * mesma lista, e é assim que o leitor de tela as anuncia. */
		<div role="tablist" aria-label="Filtrar chamados" className="flex border-b">
			{TICKET_STATUSES.map((status) => {
				const selected = status === value;

				return (
					<button
						key={status}
						id={`ticket-tab-${status}`}
						type="button"
						role="tab"
						aria-selected={selected}
						onClick={() => onChange(status)}
						className={cn(
							// `-mb-px` sobrepõe a borda inferior do contêiner, senão a
							// linha da aba ativa fica flutuando acima dela.
							'-mb-px flex flex-1 items-center justify-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors sm:flex-none sm:px-8',
							selected
								? 'border-primary text-primary'
								: 'text-muted-foreground hover:text-foreground border-transparent',
						)}
					>
						{TAB_LABELS[status]}

						<span
							className={cn(
								'rounded-full px-2 py-0.5 text-xs font-bold tabular-nums',
								selected ? 'bg-primary text-primary-foreground' : 'bg-muted',
							)}
						>
							{counts[status]}
						</span>
					</button>
				);
			})}
		</div>
	);
}
