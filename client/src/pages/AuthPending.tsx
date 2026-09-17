import { PageSkeleton } from '@/shared/components/PageSkeleton';
import { AppLayout } from '@/shared/layouts/AppLayout';

/** Estado de carregamento das rotas protegidas, já dentro do layout. */
export function AuthPending() {
	return (
		<AppLayout>
			<PageSkeleton />
		</AppLayout>
	);
}
