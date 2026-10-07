/** `%` e `_` digitados na busca são literais, não curingas do LIKE. */
export function toLikePattern(term: string): string {
	return `%${term.replace(/[\\%_]/g, (char) => `\\${char}`)}%`;
}

/**
 * Fuso de referência do filtro de data.
 *
 * O filtro vem de um `<input type="date">`, que manda só `YYYY-MM-DD` — uma
 * data de calendário, sem hora e sem fuso. Interpretá-la exige escolher um
 * fuso, e as duas escolhas implícitas estavam erradas:
 *
 * - `new Date('2026-01-31')` é meia-noite **UTC**. Para quem está em UTC-3, o
 *   dia 31 começava às 21h do dia 30.
 * - `setHours(23,59,59)` usa o fuso do **processo**, que em container é UTC
 *   (`node:22-alpine` não define `TZ`). O dia 31 terminava às 20h59 locais, e
 *   as últimas três horas sumiam do resultado sem aviso.
 *
 * O público do sistema é um só e é brasileiro (`AGENTS.md`), então o fuso fica
 * fixo aqui em vez de virar configuração. Projeto derivado com usuário em outro
 * fuso troca esta constante — ou passa a enviar data-hora com offset do client.
 */
const TIMEZONE_OFFSET = '-03:00';

/** `2026-01-31` → `2026-01-31T00:00:00` no fuso de referência. */
export function startOfDay(value: string): Date {
	return new Date(`${isoDate(value)}T00:00:00.000${TIMEZONE_OFFSET}`);
}

/** `2026-01-31` → `2026-01-31T23:59:59.999` no fuso de referência. */
export function endOfDay(value: string): Date {
	return new Date(`${isoDate(value)}T23:59:59.999${TIMEZONE_OFFSET}`);
}

/**
 * A parte de data do valor recebido. O DTO valida com `@IsDateString()`, que
 * aceita ISO completo: sem cortar aqui, `endOfDay('2026-01-31T10:00:00Z')`
 * montaria uma string inválida.
 */
function isoDate(value: string): string {
	return value.slice(0, 10);
}
