import { useMyScreens } from '@/modules/roles/hooks/useMyScreens';
import { AdminRoles } from '@/pages/AdminRoles';
import { AuthPending } from '@/pages/AuthPending';
import { Forbidden } from '@/pages/Forbidden';

/**
 * Mostra a listagem de cargos para quem tem a tela e 403 para os demais.
 * A autorização real é do backend (`ScreensGuard`); isto é só UX.
 */
export function AdminRolesGuarded() {
	const { can, isPending } = useMyScreens();

	if (isPending) {
		return <AuthPending />;
	}

	return can('admin.roles') ? <AdminRoles /> : <Forbidden />;
}
