import { createFileRoute } from '@tanstack/react-router';
import { AdminAuditGuarded } from '@/pages/AdminAuditGuarded';
import { auditLogQueryOptions } from '@/modules/audit/hooks/useAuditLog';
import { myPermissionsQueryOptions } from '@/modules/roles/hooks/useMyPermissions';

export const Route = createFileRoute('/_auth/admin/audit')({
	/*
	 * Permissões e primeira página saem juntas, antes do primeiro render. Ver
	 * `admin/users.tsx`.
	 *
	 * `ensureInfiniteQueryData` porque a lista é infinita — `ensureQueryData`
	 * gravaria no cache um formato sem `pages`, que o `useSuspenseInfiniteQuery`
	 * do componente não lê. Filtros vazios: é como o painel abre.
	 */
	loader: async ({ context }) => {
		await Promise.all([
			context.queryClient.ensureQueryData(myPermissionsQueryOptions),
			context.queryClient.ensureInfiniteQueryData(auditLogQueryOptions()),
		]);
	},
	component: AdminAuditGuarded,
});
