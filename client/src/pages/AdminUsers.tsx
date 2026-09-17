import { Suspense } from 'react';
import { CreateUserDialog } from '@/modules/users/components/CreateUserDialog';
import { UsersPanel } from '@/modules/users/components/UsersPanel';
import { UsersTableSkeleton } from '@/modules/users/skeletons/UsersTableSkeleton';
import { PageHeader } from '@/shared/components/PageHeader';
import { useAuth } from '@/shared/hooks/useAuth';
import { AppLayout } from '@/shared/layouts/AppLayout';

export function AdminUsers() {
	const { user } = useAuth();

	return (
		<AppLayout>
			<div className="flex flex-col gap-8">
				<div className="flex flex-wrap items-end justify-between gap-4">
					<PageHeader
						title="Usuários"
						description="Crie contas e gerencie quem tem acesso ao sistema."
					/>
					<CreateUserDialog />
				</div>

				<Suspense fallback={<UsersTableSkeleton />}>
					<UsersPanel currentUserId={user?.id ?? ''} />
				</Suspense>
			</div>
		</AppLayout>
	);
}
