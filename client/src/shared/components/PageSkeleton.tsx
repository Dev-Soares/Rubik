import { Skeleton } from '@/shared/components/ui/skeleton';

const CARDS = [0, 1, 2, 3, 4, 5];

/** Placeholder das rotas protegidas enquanto o loader resolve. */
export function PageSkeleton() {
	return (
		<div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
			{CARDS.map((index) => (
				<div key={index} className="bg-muted/50 flex flex-col gap-4 rounded-xl p-5">
					<Skeleton className="h-6 w-28" />
					<Skeleton className="h-4 w-full" />
					<Skeleton className="h-4 w-3/4" />
				</div>
			))}
		</div>
	);
}
