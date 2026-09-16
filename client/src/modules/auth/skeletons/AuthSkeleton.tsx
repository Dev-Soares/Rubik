import { Skeleton } from '@/shared/components/ui/skeleton';

export function AuthSkeleton() {
	return (
		<div className="flex flex-col gap-4">
			<Skeleton className="h-16" />
			<Skeleton className="h-16" />
			<Skeleton className="h-10" />
		</div>
	);
}
