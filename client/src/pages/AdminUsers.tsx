import { Suspense } from 'react';
import { useMyPermissions } from '@/modules/roles/hooks/useMyPermissions';
import { CreateUserDialog } from '@/modules/users/components/CreateUserDialog';
import { UsersPanel } from '@/modules/users/components/UsersPanel';
import { UsersTableSkeleton } from '@/modules/users/skeletons/UsersTableSkeleton';
import { PageHeader } from '@/shared/components/PageHeader';
import { useAuth } from '@/shared/hooks/useAuth';
import { PageWidth } from '@/shared/components/PageWidth';

export function AdminUsers() {
	const { user } = useAuth();
	const { can } = useMyPermissions();

	return (
		<PageWidth>
			<div className="flex flex-col gap-8">
				<div className="flex flex-wrap items-end justify-between gap-4">
					<PageHeader
						title="Usuários"
						description="Crie contas e gerencie quem tem acesso ao sistema."
					/>
					{can('usuarios', 'criar') ? <CreateUserDialog /> : null}
				</div>

				<Suspense fallback={<UsersTableSkeleton />}>
					<UsersPanel currentUserId={user?.id ?? ''} />
				</Suspense>
			</div>
		</PageWidth>
	);
}
