import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { AuthError } from '@/pages/AuthError';
import { AuthPending } from '@/pages/AuthPending';
import { sessionQueryOptions } from '@/shared/hooks/useAuth';

/** Layout pathless que protege todas as rotas em `routes/_auth/`. */
export const Route = createFileRoute('/_auth')({
	beforeLoad: async ({ context, location }) => {
		const session = await context.queryClient.ensureQueryData(sessionQueryOptions);

		if (!session) {
			throw redirect({ to: '/', search: { redirect: location.href } });
		}

		return { session };
	},
	component: Outlet,
	pendingComponent: AuthPending,
	errorComponent: AuthError,
});
