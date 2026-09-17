import { Skeleton } from '@/shared/components/ui/skeleton';

const CARDS = 4;

export function RolesGridSkeleton() {
	return (
		<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
			{Array.from({ length: CARDS }, (_, index) => (
				<Skeleton key={index} className="h-44 rounded-xl" />
			))}
		</div>
	);
}
