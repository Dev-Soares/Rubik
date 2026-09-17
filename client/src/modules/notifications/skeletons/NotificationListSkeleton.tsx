import { Skeleton } from '@/shared/components/ui/skeleton';

type NotificationListSkeletonProps = {
	items?: number;
};

export function NotificationListSkeleton({ items = 5 }: NotificationListSkeletonProps) {
	return (
		<div className="flex flex-col gap-1">
			{Array.from({ length: items }, (_, index) => (
				<div key={index} className="flex gap-3 px-3 py-3">
					<Skeleton className="mt-1.5 size-2 shrink-0 rounded-full" />
					<div className="flex flex-1 flex-col gap-2">
						<Skeleton className="h-4 w-48" />
						<Skeleton className="h-3 w-64" />
					</div>
				</div>
			))}
		</div>
	);
}
