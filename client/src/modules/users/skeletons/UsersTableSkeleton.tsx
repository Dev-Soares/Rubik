import { Skeleton } from '@/shared/components/ui/skeleton';

const ROWS = 5;

export function UsersTableSkeleton() {
	return (
		<div className="flex flex-col gap-2 rounded-xl border p-4">
			{Array.from({ length: ROWS }, (_, index) => (
				<Skeleton key={index} className="h-12" />
			))}
		</div>
	);
}
