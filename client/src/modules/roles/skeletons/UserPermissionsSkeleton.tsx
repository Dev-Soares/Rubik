import { MODULES } from '@/modules/roles/types/role';
import { Skeleton } from '@/shared/components/ui/skeleton';

export function UserPermissionsSkeleton() {
	return (
		<div className="flex flex-col gap-4">
			{MODULES.map((module) => (
				<div key={module} className="flex flex-col gap-2">
					<Skeleton className="h-3 w-24" />
					<Skeleton className="h-20 rounded-md" />
				</div>
			))}
		</div>
	);
}
