import { IsIn } from 'class-validator';
import {
	LEGACY_OPEN_STATUS,
	TICKET_STATUSES,
	type TicketStatus,
} from 'src/modules/tickets/types/ticket.types';

export class UpdateTicketStatusDto {
	/**
	 * Aceita `aberto` além dos estados atuais: é a entrada de uma integração
	 * que não versiona junto com esta API, e recusar o nome antigo trocaria
	 * um chamado atualizado por um 400. `TicketsService.updateStatus`
	 * normaliza para `recebido` antes de gravar.
	 */
	@IsIn([...TICKET_STATUSES, LEGACY_OPEN_STATUS], {
		message: 'status deve ser "recebido" ou "resolvido".',
	})
	status!: TicketStatus | typeof LEGACY_OPEN_STATUS;
}
