import { api } from '@/api/axios';
import type {
	PaginatedTickets,
	Ticket,
	TicketCounts,
	TicketFormInput,
	TicketStatus,
	UnseenResolvedCount,
} from '@/modules/tickets/types/ticket';
import { toTicketFormData } from '@/modules/tickets/utils';

export async function listTicketsService(params: {
	limit: number;
	offset: number;
	status?: TicketStatus;
}): Promise<PaginatedTickets> {
	const { data } = await api.get<PaginatedTickets>('/tickets', { params });
	return data;
}

export async function getTicketCountsService(): Promise<TicketCounts> {
	const { data } = await api.get<TicketCounts>('/tickets/counts');
	return data;
}

export async function getTicketService(id: string): Promise<Ticket> {
	const { data } = await api.get<Ticket>(`/tickets/${id}`);
	return data;
}

export async function getUnseenResolvedService(): Promise<UnseenResolvedCount> {
	const { data } = await api.get<UnseenResolvedCount>('/tickets/unseen-resolved');
	return data;
}

export async function markTicketsSeenService(): Promise<{ marked: number }> {
	const { data } = await api.patch<{ marked: number }>('/tickets/seen');
	return data;
}

/**
 * O `Content-Type` sai vazio de propósito: o axios só escreve o boundary do
 * multipart quando não há header definido, e a instância declara JSON por
 * padrão. Sem isto o backend recebe um corpo sem boundary e recusa.
 */
export async function createTicketService(input: TicketFormInput): Promise<Ticket> {
	const { data } = await api.post<Ticket>('/tickets', toTicketFormData(input), {
		headers: { 'Content-Type': undefined },
	});
	return data;
}
