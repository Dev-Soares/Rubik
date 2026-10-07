import { PageSkeleton } from '@/shared/components/PageSkeleton';
import { PageWidth } from '@/shared/components/PageWidth';

/**
 * Carregamento das rotas protegidas.
 *
 * Sem `AppLayout` em volta: este é o `pendingComponent` da própria rota `_auth`,
 * que já monta a casca. Montá-la aqui também renderizava uma segunda sidebar
 * dentro da primeira a cada navegação lenta.
 */
export function AuthPending() {
	return (
		<PageWidth>
			<PageSkeleton />
		</PageWidth>
	);
}
