import { AuditTimelineItem } from '@/modules/audit/components/AuditTimelineItem';
import type { AuditLogEntry } from '@/modules/audit/types/audit';
import { groupByDay } from '@/modules/audit/utils';

type AuditTimelineProps = {
	entries: AuditLogEntry[];
};

const dayFormatter = new Intl.DateTimeFormat('pt-BR', {
	weekday: 'long',
	day: '2-digit',
	month: 'long',
});

export function AuditTimeline({ entries }: AuditTimelineProps) {
	if (entries.length === 0) {
		return (
			<p className="text-muted-foreground py-12 text-center text-sm">
				Nenhuma movimentação registrada.
			</p>
		);
	}

	const groups = groupByDay(entries);

	return (
		<div className="flex flex-col gap-8">
			{groups.map((group) => (
				<section key={group.day} className="flex flex-col gap-4">
					<h2 className="text-primary text-xs font-bold tracking-wider uppercase">
						{/* `T00:00` força hora local: só a data viraria o dia anterior em UTC. */}
						{dayFormatter.format(new Date(`${group.day}T00:00`))}
					</h2>

					<ol className="flex flex-col">
						{group.entries.map((entry) => (
							<AuditTimelineItem key={entry.id} entry={entry} />
						))}
					</ol>
				</section>
			))}
		</div>
	);
}
