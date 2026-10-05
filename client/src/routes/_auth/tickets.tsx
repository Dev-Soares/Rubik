import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { TicketsGuarded } from '@/pages/TicketsGuarded';
import { ticketCountsQueryOptions } from '@/modules/tickets/hooks/useTicketCounts';
import { ticketsQueryOptions } from '@/modules/tickets/hooks/useTickets';
import { isAdminRole } from '@/shared/utils/roles';

/** `?ticket=<id>` abre a tela já no chamado que a notificação aponta. */
const searchSchema = z.object({
	ticket: z.string().optional(),
});

export const Route = createFileRoute('/_auth/tickets')({
	validateSearch: searchSchema,
	/*
	 * A aba é de administrador. Decidido aqui, e não num componente, porque o
	 * `beforeLoad` roda ANTES do loader: sem isto o pré-carregamento dispararia
	 * as requisições e o usuário comum veria o 403 da API em vez desta página.
	 *
	 * `context.session` vem do `_auth.tsx`, que já a carregou. É só UX — quem
	 * autoriza de verdade é o `RolesGuard` do backend.
	 */
	beforeLoad: ({ context }) => {
		if (!isAdminRole(context.session?.user.role)) {
			return { forbidden: true };
		}

		return { forbidden: false };
	},
	loader: async ({ context }) => {
		if (context.forbidden) {
			return;
		}

		await Promise.all([
			// Mesmo filtro que o painel abre: precarregar outro status renderia
			// duas requisições e nenhuma delas seria a exibida.
			context.queryClient.ensureInfiniteQueryData(ticketsQueryOptions('recebido')),
			// O painel lê a contagem com `useSuspenseQuery`; sem o cache quente
			// ele suspenderia a página inteira, não só a lista.
			context.queryClient.ensureQueryData(ticketCountsQueryOptions()),
		]);
	},
	component: TicketsGuarded,
});
