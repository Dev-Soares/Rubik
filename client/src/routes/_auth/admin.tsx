import { createFileRoute, redirect } from '@tanstack/react-router';
import { Admin } from '@/pages/Admin';
import { sessionQueryOptions } from '@/shared/hooks/useAuth';

export const Route = createFileRoute('/_auth/admin')({
	beforeLoad: async ({ context }) => {
		const session = await context.queryClient.ensureQueryData(sessionQueryOptions);
		const isAdmin = session?.user.role?.split(',').includes('admin') ?? false;

		if (!isAdmin) {
			throw redirect({ to: '/dashboard' });
		}
	},
	component: Admin,
});
