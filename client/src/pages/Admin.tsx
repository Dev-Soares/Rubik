import { Suspense } from 'react';
import { UsersPanel } from '@/modules/users/components/UsersPanel';
import { UsersTableSkeleton } from '@/modules/users/skeletons/UsersTableSkeleton';
import { useAuth } from '@/shared/hooks/useAuth';
import { AppLayout } from '@/shared/layouts/AppLayout';

export function Admin() {
	const { user } = useAuth();

	return (
		<AppLayout>
			<div className="flex flex-col gap-6">
				<h1 className="text-content text-2xl font-semibold">Administração</h1>

				<Suspense fallback={<UsersTableSkeleton />}>
					<UsersPanel currentUserId={user?.id ?? ''} />
				</Suspense>
			</div>
		</AppLayout>
	);
}
