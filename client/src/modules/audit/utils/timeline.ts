import type { AuditDayGroup, AuditLogEntry, PaginatedAuditLog } from '@/modules/audit/types/audit';

/** Chave local (`YYYY-MM-DD`): `toISOString` agruparia pelo dia em UTC. */
function toDayKey(value: string): string {
	const date = new Date(value);
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${date.getFullYear()}-${month}-${day}`;
}

/** A lista já vem ordenada do backend, então basta quebrar na virada do dia. */
export function groupByDay(entries: AuditLogEntry[]): AuditDayGroup[] {
	const groups: AuditDayGroup[] = [];

	for (const entry of entries) {
		const day = toDayKey(entry.createdAt);
		const current = groups.at(-1);

		if (current?.day === day) {
			current.entries.push(entry);
			continue;
		}

		groups.push({ day, entries: [entry] });
	}

	return groups;
}

/** `undefined` encerra a paginação infinita. */
export function nextOffset(last: PaginatedAuditLog): number | undefined {
	const loaded = last.offset + last.items.length;
	return loaded < last.total ? loaded : undefined;
}
