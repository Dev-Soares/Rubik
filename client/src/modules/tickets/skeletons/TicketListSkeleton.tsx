import { Skeleton } from '@/shared/components/ui/skeleton';

type TicketListSkeletonProps = {
	items?: number;
};

export function TicketListSkeleton({ items = 6 }: TicketListSkeletonProps) {
	return (
		/* Mesma grade e altura da lista: sem isto o conteúdo salta ao carregar. */
		<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
			{Array.from({ length: items }, (_, index) => (
				<div key={index} className="flex flex-col gap-2 rounded-xl border px-4 py-3">
					<Skeleton className="h-4 w-11/12" />
					<Skeleton className="h-4 w-2/3" />
					<Skeleton className="h-5 w-16 rounded-full" />
					<Skeleton className="h-3 w-32" />
				</div>
			))}
		</div>
	);
}
