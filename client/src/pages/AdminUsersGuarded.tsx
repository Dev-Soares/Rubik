import { AdminUsers } from '@/pages/AdminUsers';
import { Forbidden } from '@/pages/Forbidden';
import { useAuth } from '@/shared/hooks/useAuth';

/**
 * Mostra a gestão de usuários para admins e 403 para os demais.
 * A autorização real é do backend (`RolesGuard`); isto é só UX.
 */
export function AdminUsersGuarded() {
	const { isAdmin } = useAuth();

	return isAdmin ? <AdminUsers /> : <Forbidden />;
}
