import { AdminRoles } from '@/pages/AdminRoles';
import { Forbidden } from '@/pages/Forbidden';
import { useAuth } from '@/shared/hooks/useAuth';

/**
 * Mostra a listagem de cargos para admins e 403 para os demais.
 * A autorização real é do backend (`RolesGuard`); isto é só UX.
 */
export function AdminRolesGuarded() {
	const { isAdmin } = useAuth();

	return isAdmin ? <AdminRoles /> : <Forbidden />;
}
