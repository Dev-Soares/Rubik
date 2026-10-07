import { createFileRoute } from '@tanstack/react-router';
import { AdminRolesGuarded } from '@/pages/AdminRolesGuarded';
import { myPermissionsQueryOptions } from '@/modules/roles/hooks/useMyPermissions';
import { rolesQueryOptions } from '@/modules/roles/hooks/useRoles';

export const Route = createFileRoute('/_auth/admin/roles')({
	// Permissões e lista são independentes: saem juntas, antes do primeiro
	// render, em vez de uma esperar a outra. Ver `admin/users.tsx`.
	loader: async ({ context }) => {
		await Promise.all([
			context.queryClient.ensureQueryData(myPermissionsQueryOptions),
			context.queryClient.ensureQueryData(rolesQueryOptions(0)),
		]);
	},
	component: AdminRolesGuarded,
});
