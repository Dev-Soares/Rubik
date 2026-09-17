import {
	DEFAULT_NOTIFICATION_TONE,
	NOTIFICATION_TONES,
	type NotificationTone,
	type PaginatedNotifications,
} from '@/modules/notifications/types/notification';

/** `undefined` encerra a paginação infinita. */
export function nextOffset(last: PaginatedNotifications): number | undefined {
	const loaded = last.offset + last.items.length;
	return loaded < last.total ? loaded : undefined;
}

/** Destaque do tipo; tipo não registrado cai no neutro. */
export function toneOf(kind: string): NotificationTone {
	return NOTIFICATION_TONES[kind] ?? DEFAULT_NOTIFICATION_TONE;
}

const MAX_BADGE_COUNT = 99;

/** Acima do teto o número perde legibilidade no badge do sino. */
export function formatBadgeCount(count: number): string {
	return count > MAX_BADGE_COUNT ? `${MAX_BADGE_COUNT}+` : String(count);
}

const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;
const WEEK_MS = 7 * DAY_MS;

const dayFormatter = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' });
const fullFormatter = new Intl.DateTimeFormat('pt-BR', {
	dateStyle: 'short',
	timeStyle: 'short',
});

/**
 * Idade do aviso em forma curta. A data completa não cabe na linha do título
 * sem ser truncada, e para algo recente o intervalo diz mais que o horário.
 * Acima de uma semana volta a data, quando o "há N dias" deixa de ajudar.
 */
export function formatAge(value: string, now: Date = new Date()): string {
	const elapsed = now.getTime() - new Date(value).getTime();

	if (elapsed < MINUTE_MS) {
		return 'agora';
	}
	if (elapsed < HOUR_MS) {
		return `${Math.floor(elapsed / MINUTE_MS)} min`;
	}
	if (elapsed < DAY_MS) {
		return `${Math.floor(elapsed / HOUR_MS)} h`;
	}
	if (elapsed < WEEK_MS) {
		return `${Math.floor(elapsed / DAY_MS)} d`;
	}
	return dayFormatter.format(new Date(value));
}

/** Data por extenso, para o `title` do horário abreviado. */
export function formatFullDate(value: string): string {
	return fullFormatter.format(new Date(value));
}
