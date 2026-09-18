import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import { TICKET_STATUSES, type TicketStatus } from 'src/modules/tickets/types/ticket.types';

export class UpdateTicketStatusDto {
	@ApiProperty({ enum: TICKET_STATUSES })
	@IsIn(TICKET_STATUSES, { message: 'status deve ser "aberto" ou "resolvido".' })
	status!: TicketStatus;
}
