import { Suspense } from 'react';
import { CreateRoleDialog } from '@/modules/roles/components/CreateRoleDialog';
import { useMyPermissions } from '@/modules/roles/hooks/useMyPermissions';
import { RolesPanel } from '@/modules/roles/components/RolesPanel';
import { RolesGridSkeleton } from '@/modules/roles/skeletons/RolesGridSkeleton';
import { PageHeader } from '@/shared/components/PageHeader';
import { AppLayout } from '@/shared/layouts/AppLayout';

export function AdminRoles() {
	const { can } = useMyPermissions();

	return (
		<AppLayout>
			<div className="flex flex-col gap-8">
				<div className="flex flex-wrap items-end justify-between gap-4">
					<PageHeader
						title="Cargos"
						description="Crie cargos e defina o acesso de cada um às telas."
					/>
					{can('cargos', 'criar') ? <CreateRoleDialog /> : null}
				</div>

				<Suspense fallback={<RolesGridSkeleton />}>
					<RolesPanel />
				</Suspense>
			</div>
		</AppLayout>
	);
}
