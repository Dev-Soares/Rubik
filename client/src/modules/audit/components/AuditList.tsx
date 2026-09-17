import { AuditTimeline } from '@/modules/audit/components/AuditTimeline';
import { useAuditLog } from '@/modules/audit/hooks/useAuditLog';
import type { AuditFilters } from '@/modules/audit/types/audit';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { useInfiniteScroll } from '@/shared/hooks/useInfiniteScroll';

type AuditListProps = {
	filters: AuditFilters;
};

export function AuditList({ filters }: AuditListProps) {
	const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useAuditLog(filters);

	const sentinelRef = useInfiniteScroll({
		hasMore: hasNextPage,
		isLoading: isFetchingNextPage,
		onLoadMore: () => void fetchNextPage(),
	});

	const entries = data.pages.flatMap((page) => page.items);
	const total = data.pages[0]?.total ?? 0;

	return (
		<div className="flex flex-col gap-6">
			<AuditTimeline entries={entries} />

			{/* Sentinela: entrar na tela dispara a próxima página. */}
			<div ref={sentinelRef} aria-hidden />

			{isFetchingNextPage ? (
				<div role="status" aria-label="Carregando mais movimentações" className="flex gap-4">
					<Skeleton className="size-8 shrink-0 rounded-full" />
					<div className="flex flex-1 flex-col gap-2">
						<Skeleton className="h-4 w-64" />
						<Skeleton className="h-3 w-48" />
					</div>
				</div>
			) : null}

			{entries.length > 0 ? (
				<p className="text-muted-foreground text-sm">
					{hasNextPage
						? `${entries.length} de ${total} movimentações`
						: `${total} ${total === 1 ? 'movimentação' : 'movimentações'}`}
				</p>
			) : null}
		</div>
	);
}
