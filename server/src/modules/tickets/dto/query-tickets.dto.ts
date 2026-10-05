import { IsIn, IsOptional } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { TICKET_STATUSES, type TicketStatus } from 'src/modules/tickets/types/ticket.types';

export class QueryTicketsDto extends PaginationDto {
	/** Restringe a um status. Ausente, a lista traz todos. */
	@IsOptional()
	@IsIn(TICKET_STATUSES, { message: 'status deve ser "recebido" ou "resolvido".' })
	status?: TicketStatus;
}
