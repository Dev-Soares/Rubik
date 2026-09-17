import { Skeleton } from '@/shared/components/ui/skeleton';

const ITEMS = 5;

export function AuditTimelineSkeleton() {
	return (
		<div className="flex flex-col gap-4">
			<Skeleton className="h-3 w-40" />

			{Array.from({ length: ITEMS }, (_, index) => (
				<div key={index} className="flex gap-4 pb-6">
					<Skeleton className="size-8 shrink-0 rounded-full" />
					<div className="flex flex-1 flex-col gap-2">
						<Skeleton className="h-4 w-64" />
						<Skeleton className="h-3 w-48" />
					</div>
				</div>
			))}
		</div>
	);
}
