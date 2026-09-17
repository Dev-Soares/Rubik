import { Skeleton } from '@/shared/components/ui/skeleton';

const NAV_ITEMS = 6;
const STEPS = 4;

export function GuideSkeleton() {
	return (
		<div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[16rem_1fr] lg:gap-12">
			<div className="flex flex-col gap-2">
				{Array.from({ length: NAV_ITEMS }, (_, index) => (
					<Skeleton key={index} className="h-9 rounded-md" />
				))}
			</div>

			<div className="flex flex-col gap-8">
				<Skeleton className="h-16 rounded-lg" />

				{Array.from({ length: STEPS }, (_, index) => (
					<Skeleton key={index} className="h-16 rounded-lg" />
				))}
			</div>
		</div>
	);
}
