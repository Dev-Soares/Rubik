import { PencilIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import {
	AUDIT_ACTION_LABELS,
	AUDIT_ENTITY_SINGULAR,
	type AuditAction,
	type AuditLogEntry,
} from '@/modules/audit/types/audit';

type AuditTimelineItemProps = {
	entry: AuditLogEntry;
};

const ICON_BY_ACTION: Record<AuditAction, LucideIcon> = {
	create: PlusIcon,
	update: PencilIcon,
	delete: Trash2Icon,
};

/** Cor do marcador por ação: criar é positivo, remover é destrutivo. */
const MARKER_CLASS_BY_ACTION: Record<AuditAction, string> = {
	create: 'bg-primary/15 text-primary',
	update: 'bg-muted text-muted-foreground',
	delete: 'bg-destructive/15 text-destructive',
};

const timeFormatter = new Intl.DateTimeFormat('pt-BR', { timeStyle: 'short' });

export function AuditTimelineItem({ entry }: AuditTimelineItemProps) {
	const Icon = ICON_BY_ACTION[entry.action];
	const entity = AUDIT_ENTITY_SINGULAR[entry.entity] ?? entry.entity;

	return (
		<li className="group relative flex gap-4 pb-6 last:pb-0">
			{/*
			 * A linha da trilha nasce no marcador e desce até o próximo item; o
			 * último não a desenha, senão sobra um traço solto no fim da lista.
			 */}
			<span
				aria-hidden
				className="bg-border absolute top-9 bottom-0 left-4 w-px -translate-x-1/2 group-last:hidden"
			/>

			<span
				className={`z-10 flex size-8 shrink-0 items-center justify-center rounded-full ${MARKER_CLASS_BY_ACTION[entry.action]}`}
			>
				<Icon className="size-4" />
			</span>

			<div className="flex min-w-0 flex-1 flex-col gap-1.5">
				<div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
					<span className="text-sm font-semibold">{entry.userName}</span>
					<span className="text-muted-foreground text-sm">
						{AUDIT_ACTION_LABELS[entry.action].toLowerCase()}{' '}
						<span className="text-foreground font-medium">{entity}</span>
					</span>
					<time
						dateTime={entry.createdAt}
						className="text-primary ml-auto text-xs font-semibold whitespace-nowrap"
					>
						{timeFormatter.format(new Date(entry.createdAt))}
					</time>
				</div>

				<div className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
					<span>{entry.userEmail}</span>

					{entry.entityId ? (
						// O id completo é longo demais para a linha; o título traz o valor inteiro.
						<span className="font-mono" title={entry.entityId}>
							#{entry.entityId.slice(0, 8)}
						</span>
					) : null}
				</div>
			</div>
		</li>
	);
}
