import { useMyPermissions } from '@/modules/roles/hooks/useMyPermissions';
import { AdminUsers } from '@/pages/AdminUsers';
import { AuthPending } from '@/pages/AuthPending';
import { Forbidden } from '@/pages/Forbidden';

/**
 * Mostra a gestão de usuários para quem tem a tela e 403 para os demais.
 * A autorização real é do backend (`AccessGuard`); isto é só UX.
 */
export function AdminUsersGuarded() {
	const { can, isPending } = useMyPermissions();

	if (isPending) {
		return <AuthPending />;
	}

	return can('usuarios') ? <AdminUsers /> : <Forbidden />;
}
