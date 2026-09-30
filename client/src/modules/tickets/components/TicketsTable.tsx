import { CheckIcon, PaperclipIcon } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { cn } from 'cn';
import type { Ticket } from '@/modules/tickets/types/ticket';
import { isDone, statusLabel } from '@/modules/tickets/utils';
import { Badge } from '@/shared/components/ui/badge';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/shared/components/ui/table';

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
	day: '2-digit',
	month: 'short',
	hour: '2-digit',
	minute: '2-digit',
});

type TicketsTableProps = {
	tickets: Ticket[];
	/** Chamado apontado pela notificação, destacado na lista. */
	highlightedId?: string;
};

export function TicketsTable({ tickets, highlightedId }: TicketsTableProps) {
	const highlightedRef = useRef<HTMLTableRowElement>(null);

	/*
	 * Traz o chamado apontado para a vista. Efeito colateral real sobre o DOM, e
	 * não derivação de estado: numa lista longa a linha ficaria fora da tela e o
	 * usuário não veria o que a notificação prometeu abrir.
	 */
	useEffect(() => {
		if (highlightedId) {
			highlightedRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
		}
	}, [highlightedId]);

	return (
		<div className="rounded-xl border">
			{/*
			 * `table-fixed` + truncagem no assunto mantêm tudo dentro da largura: a
			 * tabela nunca rola de lado, nem reserva a barra de rolagem. O respiro
			 * lateral cresce a partir do `sm` — no celular o que falta é espaço
			 * horizontal.
			 */}
			<Table className="table-fixed [&_td]:overflow-hidden [&_td]:px-4 [&_td]:py-4 [&_th]:h-12 [&_th]:px-4 sm:[&_td]:px-6 sm:[&_th]:px-6">
				<TableHeader>
					<TableRow>
						<TableHead>Assunto</TableHead>
						<TableHead className="w-28">Status</TableHead>
						{/* Autor e data saem no celular: assunto e status bastam para achar a linha. */}
						<TableHead className="hidden w-44 sm:table-cell">Aberto por</TableHead>
						{/* Largura folgada: com `w-32` o texto da data preenchia a coluna
						    inteira e encostava na borda direita da tabela. */}
						<TableHead className="hidden w-40 md:table-cell">Data</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{tickets.map((ticket) => {
						const highlighted = ticket.id === highlightedId;
						const photoCount = ticket.photos.length;

						return (
							<TableRow
								key={ticket.id}
								ref={highlighted ? highlightedRef : undefined}
								className={cn(highlighted && 'bg-primary/10 hover:bg-primary/10')}
							>
								<TableCell>
									<span className="flex min-w-0 items-center gap-2">
										<span className="truncate font-medium">{ticket.title}</span>
										{photoCount > 0 ? (
											/* Só informa que há anexo: a foto não é aberta por esta tela. */
											<span
												className="text-muted-foreground flex shrink-0 items-center gap-1 text-xs"
												title={photoCount === 1 ? '1 foto anexada' : `${photoCount} fotos anexadas`}
											>
												<PaperclipIcon className="size-3.5" aria-hidden />
												{photoCount}
											</span>
										) : null}
									</span>
									{/* O que a tabela esconde no celular volta aqui, numa segunda linha. */}
									<span className="text-muted-foreground mt-1 block truncate text-xs sm:hidden">
										{ticket.userName}
										<span className="px-1.5 opacity-40">|</span>
										{dateFormatter.format(new Date(ticket.createdAt))}
									</span>
								</TableCell>
								<TableCell>
									<Badge
										variant={isDone(ticket.status) ? 'secondary' : 'default'}
										className="gap-1 text-[0.7rem]"
									>
										{isDone(ticket.status) ? <CheckIcon className="size-3" aria-hidden /> : null}
										{statusLabel(ticket.status)}
									</Badge>
								</TableCell>
								<TableCell className="text-muted-foreground hidden sm:table-cell">
									<span className="block truncate">{ticket.userName}</span>
								</TableCell>
								<TableCell className="text-muted-foreground hidden md:table-cell">
									{dateFormatter.format(new Date(ticket.createdAt))}
								</TableCell>
							</TableRow>
						);
					})}
				</TableBody>
			</Table>
		</div>
	);
}
