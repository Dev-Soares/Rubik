import { Module } from '@nestjs/common';
import { TicketStorageService } from 'src/modules/tickets/ticket-storage.service';
import { TicketSyncService } from 'src/modules/tickets/ticket-sync.service';
import { TicketWebhookService } from 'src/modules/tickets/ticket-webhook.service';
import { TicketsController } from 'src/modules/tickets/tickets.controller';
import { TicketsService } from 'src/modules/tickets/tickets.service';

@Module({
	controllers: [TicketsController],
	providers: [TicketsService, TicketStorageService, TicketWebhookService, TicketSyncService],
})
export class TicketsModule {}
