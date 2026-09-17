import { createFileRoute, redirect } from '@tanstack/react-router';
import { z } from 'zod';
import { SignIn } from '@/pages/SignIn';
import { sessionQueryOptions } from '@/shared/hooks/useAuth';

const searchSchema = z.object({
	redirect: z.string().optional(),
});

/** Rota raiz é o sign-in: quem já tem sessão cai direto no perfil. */
export const Route = createFileRoute('/')({
	validateSearch: searchSchema,
	beforeLoad: async ({ context, search }) => {
		const session = await context.queryClient.ensureQueryData(sessionQueryOptions);
		if (session) {
			throw redirect({ to: search.redirect ?? '/profile' });
		}
	},
	component: SignIn,
});
