import { Skeleton } from '@/shared/components/ui/skeleton';

type TicketListSkeletonProps = {
	items?: number;
};

export function TicketListSkeleton({ items = 6 }: TicketListSkeletonProps) {
	return (
		/* Mesma moldura e altura de linha da tabela: sem isto o conteúdo salta ao
		 * carregar. */
		<div className="rounded-xl border">
			<div className="h-12 border-b" />
			{Array.from({ length: items }, (_, index) => (
				<div key={index} className="flex items-center gap-3 border-b px-4 py-4 last:border-b-0 sm:px-6">
					<Skeleton className="h-4 flex-1" />
					<Skeleton className="h-5 w-20 rounded-full" />
					<Skeleton className="hidden h-4 w-32 sm:block" />
					<Skeleton className="hidden h-4 w-24 md:block" />
				</div>
			))}
		</div>
	);
}
