import { SCREENS } from '@/modules/roles/types/role';
import { Skeleton } from '@/shared/components/ui/skeleton';

export function UserScreensSkeleton() {
	return (
		<div className="flex flex-col gap-4">
			{SCREENS.map((screen) => (
				<div key={screen} className="flex flex-col gap-2">
					<Skeleton className="h-3 w-24" />
					<Skeleton className="h-11 rounded-md" />
				</div>
			))}
		</div>
	);
}
