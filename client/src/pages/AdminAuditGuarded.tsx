import { useMyPermissions } from '@/modules/roles/hooks/useMyPermissions';
import { AdminAudit } from '@/pages/AdminAudit';
import { AuthPending } from '@/pages/AuthPending';
import { Forbidden } from '@/pages/Forbidden';

/**
 * Mostra o registro de uso para quem tem a tela e 403 para os demais.
 * A autorização real é do backend (`AccessGuard`); isto é só UX.
 */
export function AdminAuditGuarded() {
	const { can, isPending } = useMyPermissions();

	if (isPending) {
		return <AuthPending />;
	}

	return can('auditoria') ? <AdminAudit /> : <Forbidden />;
}
