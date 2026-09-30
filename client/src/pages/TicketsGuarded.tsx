import { Forbidden } from '@/pages/Forbidden';
import { Tickets } from '@/pages/Tickets';
import { useAuth } from '@/shared/hooks/useAuth';

/**
 * Mostra os chamados para administradores e 403 para os demais.
 * A autorização real é do backend (`RolesGuard`); isto é só UX.
 */
export function TicketsGuarded() {
	const { isAdmin } = useAuth();

	return isAdmin ? <Tickets /> : <Forbidden />;
}
