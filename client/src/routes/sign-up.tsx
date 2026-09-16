import { createFileRoute, redirect } from '@tanstack/react-router';
import { SignUp } from '@/pages/SignUp';
import { sessionQueryOptions } from '@/shared/hooks/useAuth';

export const Route = createFileRoute('/sign-up')({
	beforeLoad: async ({ context }) => {
		const session = await context.queryClient.ensureQueryData(sessionQueryOptions);
		if (session) {
			throw redirect({ to: '/dashboard' });
		}
	},
	component: SignUp,
});
