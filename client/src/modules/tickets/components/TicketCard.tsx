import { CheckIcon, PaperclipIcon } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { cn } from 'cn';
import type { Ticket } from '@/modules/tickets/types/ticket';
import { isDone, statusLabel } from '@/modules/tickets/utils';
import { Badge } from '@/shared/components/ui/badge';

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
	day: '2-digit',
	month: 'short',
	hour: '2-digit',
	minute: '2-digit',
});

type TicketCardProps = {
	ticket: Ticket;
	/** Chamado aberto a partir da notificação: destacado e trazido à vista. */
	highlighted?: boolean;
};

export function TicketCard({ ticket, highlighted = false }: TicketCardProps) {
	const photoCount = ticket.photos.length;
	const done = isDone(ticket.status);
	const cardRef = useRef<HTMLElement>(null);

	/*
	 * Traz o chamado apontado para a vista. Efeito colateral real sobre o DOM, e
	 * não derivação de estado: numa lista longa o destaque ficaria fora da tela
	 * e o usuário não veria o que a notificação prometeu abrir.
	 */
	useEffect(() => {
		if (highlighted) {
			cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
		}
	}, [highlighted]);

	return (
		/* `h-full` faz o card preencher a célula da grade, que por sua vez tem a
		 * altura da linha — é o que mantém todos do mesmo tamanho. */
		<article
			ref={cardRef}
			className={cn(
				'bg-card relative flex h-full flex-col items-start gap-2 rounded-xl border px-4 py-3 transition-colors',
				highlighted ? 'border-primary ring-primary/30 ring-2' : 'hover:border-primary/40',
			)}
		>
			{done ? (
				/* Marca o resolvido de longe: na grade, o selo sozinho exige ler
				 * card a card para saber o que já foi atendido. */
				<CheckIcon
					className="text-primary absolute top-3 right-3 size-9 stroke-3"
					aria-hidden
				/>
			) : null}

			{/* `pr` reserva o espaço do check para o título não passar por baixo. */}
			<h3
				className={`line-clamp-2 text-sm leading-snug font-semibold text-pretty ${
					done ? 'pr-10' : ''
				}`}
			>
				{ticket.title}
			</h3>

			<Badge variant={done ? 'secondary' : 'default'} className="text-[0.7rem]">
				{statusLabel(ticket.status)}
			</Badge>

			<p className="text-muted-foreground mt-auto truncate text-xs">
				{ticket.userName}
				<span className="px-1.5 opacity-40">|</span>
				{dateFormatter.format(new Date(ticket.createdAt))}
			</p>

			{photoCount > 0 ? (
				/* Só informa que há anexo: a foto não é aberta por esta tela. */
				<p className="text-muted-foreground flex items-center gap-1.5 text-xs">
					<PaperclipIcon className="size-3.5" aria-hidden />
					{photoCount === 1 ? '1 foto anexada' : `${photoCount} fotos anexadas`}
				</p>
			) : null}
		</article>
	);
}
