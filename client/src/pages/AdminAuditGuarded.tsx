import { AdminAudit } from '@/pages/AdminAudit';
import { Forbidden } from '@/pages/Forbidden';
import { useAuth } from '@/shared/hooks/useAuth';

/**
 * Mostra o registro de uso para admins e 403 para os demais.
 * A autorização real é do backend (`RolesGuard`); isto é só UX.
 */
export function AdminAuditGuarded() {
	const { isAdmin } = useAuth();

	return isAdmin ? <AdminAudit /> : <Forbidden />;
}
