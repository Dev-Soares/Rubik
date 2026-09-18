import {
	TICKET_STATUS_LABELS,
	TICKET_STATUSES,
	type PaginatedTickets,
	type TicketFormInput,
	type TicketStatus,
} from '@/modules/tickets/types/ticket';

/** `undefined` encerra a paginação infinita. */
export function nextOffset(last: PaginatedTickets): number | undefined {
	const loaded = last.offset + last.items.length;
	return loaded < last.total ? loaded : undefined;
}

/** Monta o corpo `multipart/form-data` que a rota de criação espera. */
export function toTicketFormData(input: TicketFormInput): FormData {
	const body = new FormData();
	body.append('title', input.title);
	for (const photo of input.photos) {
		body.append('photos', photo);
	}
	return body;
}

/**
 * Junta as fotos já escolhidas com as recém-selecionadas, respeitando o teto.
 * Sem o corte aqui o usuário só descobriria o limite ao submeter.
 */
export function mergePhotos(current: File[], added: File[], max: number): File[] {
	return [...current, ...added].slice(0, max);
}

/**
 * Rótulo do status em pt-BR. Estado que esta versão não conhece — vindo da
 * integração externa — aparece como veio, em vez de sumir da tela.
 */
export function statusLabel(status: string): string {
	return TICKET_STATUS_LABELS[status as TicketStatus] ?? status;
}

/**
 * O status vem do backend como texto livre: a integração externa pode gravar
 * um estado que esta versão não conhece, e nesse caso não há aba para abrir.
 */
export function isTicketStatus(value: string): value is TicketStatus {
	return TICKET_STATUSES.includes(value as TicketStatus);
}

/** Só `resolvido` fecha o chamado; qualquer outro estado conta como aberto. */
export function isDone(status: string): boolean {
	return status === 'resolvido';
}

/** Rodapé da lista: "3 chamados abertos", "1 chamado resolvido". */
export function formatTicketCount(total: number, status: TicketStatus): string {
	const noun = total === 1 ? 'chamado' : 'chamados';
	const suffix = total === 1 ? '' : 's';
	const state = status === 'resolvido' ? `resolvido${suffix}` : `aberto${suffix}`;
	return `${total} ${noun} ${state}`;
}

/**
 * Imagens presentes na área de transferência. Colar texto ou um arquivo que
 * não seja imagem devolve lista vazia, e o `paste` segue o curso normal —
 * é o que mantém o Ctrl+V funcionando no campo de título.
 */
export function imagesFromClipboard(data: DataTransfer | null): File[] {
	if (!data) {
		return [];
	}

	return [...data.files].filter((file) => file.type.startsWith('image/'));
}
