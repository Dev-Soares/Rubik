import { z } from 'zod';

/**
 * Teto de fotos por chamado. Espelha `MAX_TICKET_PHOTOS` do backend
 * (`server/src/modules/tickets/types/ticket.types.ts`): mudou lá, muda aqui.
 */
export const MAX_TICKET_PHOTOS = 3;

/** Tipos aceitos no anexo. Espelha `ALLOWED_PHOTO_TYPES` do backend. */
export const ALLOWED_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

/** Teto por foto, em bytes. Espelha `MAX_PHOTO_BYTES` do backend. */
export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

export const ticketFormSchema = z.object({
	title: z
		.string()
		.trim()
		.min(3, 'O título deve ter no mínimo 3 caracteres.')
		.max(120, 'O título deve ter no máximo 120 caracteres.'),
	photos: z
		.array(z.instanceof(File))
		.max(MAX_TICKET_PHOTOS, `Anexe no máximo ${MAX_TICKET_PHOTOS} fotos.`)
		.refine(
			(files) => files.every((file) => file.size <= MAX_PHOTO_BYTES),
			'Cada foto deve ter no máximo 5 MB.',
		)
		.refine(
			(files) =>
				files.every((file) =>
					ALLOWED_PHOTO_TYPES.includes(file.type as (typeof ALLOWED_PHOTO_TYPES)[number]),
				),
			'Envie apenas imagens JPG, PNG ou WEBP.',
		),
});

export type TicketFormInput = z.infer<typeof ticketFormSchema>;

/**
 * Foto do chamado. A `url` é assinada pelo backend e expira — não a guarde
 * nem a compartilhe fora da sessão de leitura.
 */
export type TicketPhoto = {
	id: string;
	url: string;
	contentType: string;
};

/**
 * Situação do chamado. Espelha `TICKET_STATUSES` do backend
 * (`server/src/modules/tickets/types/ticket.types.ts`).
 *
 * Não existe tela que altere isto: o chamado nasce `aberto` e quem grava
 * `resolvido` é uma integração externa.
 */
export const TICKET_STATUSES = ['aberto', 'resolvido'] as const;

export type TicketStatus = (typeof TICKET_STATUSES)[number];

export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
	aberto: 'Aberto',
	resolvido: 'Resolvido',
};

/**
 * Espelha `TicketEntry` do backend. As datas chegam como string ISO no JSON.
 */
export type Ticket = {
	id: string;
	/** Nulo quando o autor foi removido; `userName` permanece. */
	userId: string | null;
	userName: string;
	title: string;
	/**
	 * Texto livre: a integração externa pode trazer um estado que esta versão
	 * não conhece, então trate-o pelos utilitários, nunca comparando direto.
	 */
	status: string;
	photos: TicketPhoto[];
	createdAt: string;
};

/** Quantidade de chamados por status, para os contadores das abas. */
export type TicketCounts = Record<TicketStatus, number>;

/** Chamados do usuário resolvidos que ele ainda não viu — o aviso da sidebar. */
export type UnseenResolvedCount = {
	count: number;
};

export type PaginatedTickets = {
	items: Ticket[];
	total: number;
	limit: number;
	offset: number;
};
