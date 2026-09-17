import { useMyScreens } from '@/modules/roles/hooks/useMyScreens';
import { AdminAudit } from '@/pages/AdminAudit';
import { AuthPending } from '@/pages/AuthPending';
import { Forbidden } from '@/pages/Forbidden';

/**
 * Mostra o registro de uso para quem tem a tela e 403 para os demais.
 * A autorização real é do backend (`ScreensGuard`); isto é só UX.
 */
export function AdminAuditGuarded() {
	const { can, isPending } = useMyScreens();

	if (isPending) {
		return <AuthPending />;
	}

	return can('admin.audit') ? <AdminAudit /> : <Forbidden />;
}
