import type { Paginated } from '@/shared/types/pagination';

/**
 * Próximo `offset` da paginação infinita; `undefined` a encerra.
 *
 * Serve a `getNextPageParam` de qualquer listagem — o envelope da API é o mesmo
 * em todas, e a regra de parada é sobre o envelope, não sobre o item.
 */
export function nextOffset(last: Paginated<unknown>): number | undefined {
	const loaded = last.offset + last.items.length;
	return loaded < last.total ? loaded : undefined;
}
