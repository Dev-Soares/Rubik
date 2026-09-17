/** `%` e `_` digitados na busca são literais, não curingas do LIKE. */
export function toLikePattern(term: string): string {
	return `%${term.replace(/[\\%_]/g, (char) => `\\${char}`)}%`;
}

/** Fim do dia, para que `to=2026-01-31` inclua o próprio dia 31. */
export function endOfDay(value: string): Date {
	const date = new Date(value);
	date.setHours(23, 59, 59, 999);
	return date;
}
