const MAX_BADGE_COUNT = 99;

/** Acima do teto o número perde legibilidade no espaço de um badge. */
export function formatBadgeCount(count: number): string {
	return count > MAX_BADGE_COUNT ? `${MAX_BADGE_COUNT}+` : String(count);
}
