import { Link } from '@tanstack/react-router';
import { cn } from 'cn';
import { CheckCheckIcon } from 'lucide-react';
import type { NotificationEntry, NotificationTone } from '@/modules/notifications/types/notification';
import { formatAge, formatFullDate, toneOf } from '@/modules/notifications/utils';
import { Button } from '@/shared/components/ui/button';

type NotificationItemProps = {
	notification: NotificationEntry;
	/** Disparado ao abrir o item, para marcá-lo como lido. */
	onOpen: (notification: NotificationEntry) => void;
	/** Marca como lida sem abrir. Ausente no dropdown, que é só leitura rápida. */
	onMarkRead?: (id: string) => void;
	/** No dropdown o item é mais compacto que na página. */
	compact?: boolean;
};

/**
 * Cor do ponto de não lida. São cores sólidas porque o marcador tem 8px: na
 * versão translúcida usada em fundos maiores ele sumia contra o card.
 */
const MARKER_CLASS_BY_TONE: Record<NotificationTone, string> = {
	neutral: 'bg-primary',
	info: 'bg-sky-500',
	success: 'bg-emerald-500',
	warning: 'bg-amber-500',
	danger: 'bg-destructive',
};

export function NotificationItem({
	notification,
	onOpen,
	onMarkRead,
	compact = false,
}: NotificationItemProps) {
	const isUnread = notification.readAt === null;
	const tone = toneOf(notification.kind);

	// O duplo check só vira botão enquanto há o que marcar; depois de lida ele
	// permanece como indicador, no lugar exato onde estava.
	const showMarkRead = Boolean(onMarkRead);

	const content = (
		<>
			{/*
			 * Ponto de não lida na coluna fixa: sem ele a única diferença seria o
			 * peso do título, que some quando os títulos são curtos.
			 */}
			<span
				aria-hidden
				className={cn(
					'mt-1.5 size-2 shrink-0 rounded-full',
					isUnread ? MARKER_CLASS_BY_TONE[tone] : 'bg-transparent',
				)}
			/>

			<div className="flex min-w-0 flex-1 flex-col gap-1">
				<div className="flex items-baseline gap-2">
					<span
						className={cn(
							'min-w-0 flex-1 truncate text-sm',
							isUnread ? 'font-semibold' : 'text-muted-foreground font-medium',
						)}
					>
						{notification.title}
					</span>

					{/* Abreviado na linha; a data cheia fica no title, ao passar o mouse. */}
					<time
						dateTime={notification.createdAt}
						title={formatFullDate(notification.createdAt)}
						className="text-muted-foreground shrink-0 text-xs whitespace-nowrap tabular-nums"
					>
						{formatAge(notification.createdAt)}
					</time>
				</div>

				{notification.body ? (
					<p
						className={cn(
							'text-muted-foreground text-xs',
							// Na página o texto inteiro importa; no dropdown ele
							// empurraria os itens seguintes para fora da vista.
							compact && 'line-clamp-2',
						)}
					>
						{notification.body}
					</p>
				) : null}
			</div>
		</>
	);

	const itemClass = cn(
		'flex w-full gap-3 rounded-md py-3 pl-3 text-left transition-colors',
		// Espaço reservado à direita para o duplo check, que fica por cima do
		// item: sem isso a data corre por baixo dele e aparece cortada.
		showMarkRead ? 'pr-11' : 'pr-3',
		'hover:bg-muted/60',
	);

	return (
		<li className="group/item relative flex items-start">
			{notification.link ? (
				<Link to={notification.link} className={itemClass} onClick={() => onOpen(notification)}>
					{content}
				</Link>
			) : (
				// Sem destino, o item ainda precisa ser clicável para marcar como lido.
				<button type="button" className={itemClass} onClick={() => onOpen(notification)}>
					{content}
				</button>
			)}

			{showMarkRead ? (
				<div className="absolute top-2 right-1 flex items-center">
					{isUnread ? (
						<Button
							type="button"
							variant="ghost"
							size="icon"
							aria-label={`Marcar "${notification.title}" como lida`}
							title="Marcar como lida"
							// Aparece no hover, mas o foco por teclado também a revela.
							// No toque não há hover, então fica sempre visível no celular.
							className="text-muted-foreground opacity-100 transition-opacity sm:opacity-0 sm:group-hover/item:opacity-100 sm:focus-visible:opacity-100"
							onClick={() => onMarkRead?.(notification.id)}
						>
							<CheckCheckIcon className="size-4" />
						</Button>
					) : (
						/*
						 * Já lida: o mesmo ícone permanece, agora como estado e não como
						 * ação. Ocupa a caixa de um botão para que a data não dance de
						 * posição quando o item passa a lido.
						 */
						<span
							aria-label="Lida"
							title={`Lida em ${formatFullDate(notification.readAt ?? notification.createdAt)}`}
							className="text-primary flex size-9 items-center justify-center"
						>
							<CheckCheckIcon className="size-4" />
						</span>
					)}
				</div>
			) : null}
		</li>
	);
}
