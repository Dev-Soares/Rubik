import { useMyScreens } from '@/modules/roles/hooks/useMyScreens';
import { AdminUsers } from '@/pages/AdminUsers';
import { AuthPending } from '@/pages/AuthPending';
import { Forbidden } from '@/pages/Forbidden';

/**
 * Mostra a gestão de usuários para quem tem a tela e 403 para os demais.
 * A autorização real é do backend (`ScreensGuard`); isto é só UX.
 */
export function AdminUsersGuarded() {
	const { can, isPending } = useMyScreens();

	if (isPending) {
		return <AuthPending />;
	}

	return can('admin.users') ? <AdminUsers /> : <Forbidden />;
}
