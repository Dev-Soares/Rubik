import { Suspense } from 'react';
import { CreateRoleDialog } from '@/modules/roles/components/CreateRoleDialog';
import { useMyScreens } from '@/modules/roles/hooks/useMyScreens';
import { RolesPanel } from '@/modules/roles/components/RolesPanel';
import { RolesGridSkeleton } from '@/modules/roles/skeletons/RolesGridSkeleton';
import { PageHeader } from '@/shared/components/PageHeader';
import { AppLayout } from '@/shared/layouts/AppLayout';

export function AdminRoles() {
	const { can } = useMyScreens();

	return (
		<AppLayout>
			<div className="flex flex-col gap-8">
				<div className="flex flex-wrap items-end justify-between gap-4">
					<PageHeader
						title="Cargos"
						description="Crie cargos e defina o acesso de cada um às telas."
					/>
					{can('admin.roles', 'write') ? <CreateRoleDialog /> : null}
				</div>

				<Suspense fallback={<RolesGridSkeleton />}>
					<RolesPanel />
				</Suspense>
			</div>
		</AppLayout>
	);
}
