import { Module } from '@nestjs/common';
import { TicketStorageService } from 'src/modules/tickets/ticket-storage.service';
import { TicketsController } from 'src/modules/tickets/tickets.controller';
import { TicketsService } from 'src/modules/tickets/tickets.service';

@Module({
	controllers: [TicketsController],
	providers: [TicketsService, TicketStorageService],
})
export class TicketsModule {}
