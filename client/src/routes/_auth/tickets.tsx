import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { Tickets } from '@/pages/Tickets';
import { ticketCountsQueryOptions } from '@/modules/tickets/hooks/useTicketCounts';
import { ticketsQueryOptions } from '@/modules/tickets/hooks/useTickets';

/** `?ticket=<id>` abre a tela já no chamado que a notificação aponta. */
const searchSchema = z.object({
	ticket: z.string().optional(),
});

export const Route = createFileRoute('/_auth/tickets')({
	validateSearch: searchSchema,
	loader: async ({ context }) => {
		await Promise.all([
			// Mesmo filtro que o painel abre: precarregar outro status renderia
			// duas requisições e nenhuma delas seria a exibida.
			context.queryClient.ensureInfiniteQueryData(ticketsQueryOptions('aberto')),
			// O painel lê a contagem com `useSuspenseQuery`; sem o cache quente
			// ele suspenderia a página inteira, não só a lista.
			context.queryClient.ensureQueryData(ticketCountsQueryOptions()),
		]);
	},
	component: Tickets,
});
