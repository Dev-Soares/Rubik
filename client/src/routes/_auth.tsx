import { createFileRoute, redirect } from '@tanstack/react-router';
import { AuthError } from '@/pages/AuthError';
import { AuthPending } from '@/pages/AuthPending';
import { NotFound } from '@/pages/NotFound';
import { sessionQueryOptions } from '@/shared/hooks/useAuth';
import { AppLayout } from '@/shared/layouts/AppLayout';

/** Layout pathless que protege todas as rotas em `routes/_auth/`. */
export const Route = createFileRoute('/_auth')({
	beforeLoad: async ({ context, location }) => {
		const session = await context.queryClient.ensureQueryData(sessionQueryOptions);

		if (!session) {
			throw redirect({ to: '/', search: { redirect: location.href } });
		}

		return { session };
	},
	/*
	 * A casca (sidebar, cabeçalho, sino) é montada AQUI, não dentro de cada
	 * página: é o que a mantém viva entre navegações. Ver `AppLayout`.
	 */
	component: AppLayout,
	pendingComponent: AuthPending,
	errorComponent: AuthError,
	/*
	 * 404 de uma rota FILHA renderiza na posição do `Outlet`, ou seja dentro da
	 * casca — que já traz o cabeçalho. O padrão do router
	 * (`defaultNotFoundComponent`) usa `min-h-dvh` por ser tela de página
	 * inteira: somada à altura do cabeçalho, a página passaria a rolar na
	 * vertical. `notFoundComponent` é herdado pelas filhas, então declarar aqui
	 * cobre todas.
	 */
	notFoundComponent: () => <NotFound fillViewport={false} />,
});
