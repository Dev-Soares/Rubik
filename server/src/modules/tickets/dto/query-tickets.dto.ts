import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { TICKET_STATUSES, type TicketStatus } from 'src/modules/tickets/types/ticket.types';

export class QueryTicketsDto extends PaginationDto {
	/** Restringe a um status. Ausente, a lista traz todos. */
	@ApiPropertyOptional({ enum: TICKET_STATUSES })
	@IsOptional()
	@IsIn(TICKET_STATUSES, { message: 'status deve ser "aberto" ou "resolvido".' })
	status?: TicketStatus;
}
