import { TICKET_STATUSES, type TicketStatus } from 'src/modules/tickets/types/ticket.types';

/**
 * A coluna é texto livre: a integração externa pode gravar um estado que esta
 * versão não conhece, e o contador precisa descartá-lo em vez de assumir.
 */
export function isTicketStatus(value: string): value is TicketStatus {
	return TICKET_STATUSES.includes(value as TicketStatus);
}
