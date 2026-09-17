import { useEffect, useRef } from 'react';

type UseInfiniteScrollOptions = {
	hasMore: boolean;
	isLoading: boolean;
	onLoadMore: () => void;
};

/**
 * Observa um elemento sentinela e dispara `onLoadMore` quando ele entra na tela.
 * `rootMargin` antecipa a carga antes do fim da lista aparecer.
 */
export function useInfiniteScroll({ hasMore, isLoading, onLoadMore }: UseInfiniteScrollOptions) {
	const sentinelRef = useRef<HTMLDivElement>(null);

	// Em ref para não recriar o observer a cada render do callback.
	const loadMoreRef = useRef(onLoadMore);
	loadMoreRef.current = onLoadMore;

	useEffect(() => {
		const sentinel = sentinelRef.current;

		if (!sentinel || !hasMore || isLoading) {
			return;
		}

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry?.isIntersecting) {
					loadMoreRef.current();
				}
			},
			{ rootMargin: '200px' }
		);

		observer.observe(sentinel);

		return () => observer.disconnect();
	}, [hasMore, isLoading]);

	return sentinelRef;
}
