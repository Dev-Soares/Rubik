/**
 * Teto de fotos por chamado. É o contrato com o frontend: mudou aqui, muda em
 * `client/src/modules/tickets/types/ticket.ts`.
 */
export const MAX_TICKET_PHOTOS = 3;

/** Tipos aceitos no anexo. Só imagem — o campo é "foto", não "arquivo". */
export const ALLOWED_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

export type AllowedPhotoType = (typeof ALLOWED_PHOTO_TYPES)[number];

/** Teto por foto, em bytes. */
export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

/**
 * Situação do chamado. É o contrato com o frontend: mudou aqui, muda em
 * `client/src/modules/tickets/types/ticket.ts`.
 *
 * O chamado nasce `aberto`; quem grava `resolvido` é uma integração externa —
 * não existe rota nesta API que altere o status.
 */
export const TICKET_STATUSES = ['aberto', 'resolvido'] as const;

export type TicketStatus = (typeof TICKET_STATUSES)[number];

export const DEFAULT_TICKET_STATUS: TicketStatus = 'aberto';

/** Foto como o client a recebe: a URL é assinada e temporária. */
export type TicketPhoto = {
	id: string;
	url: string;
	contentType: string;
};

/** Chamado como o client o recebe. */
export type TicketEntry = {
	id: string;
	/** Nulo quando o autor foi removido; `userName` permanece. */
	userId: string | null;
	userName: string;
	title: string;
	/**
	 * Texto livre no banco: a integração externa pode trazer um estado que esta
	 * versão não conhece, e o client cai no rótulo neutro nesse caso.
	 */
	status: string;
	photos: TicketPhoto[];
	createdAt: Date;
};

/** Quantidade de chamados por status, para os contadores das abas. */
export type TicketCounts = Record<TicketStatus, number>;

/** Chamados do usuário resolvidos que ele ainda não viu — o aviso da sidebar. */
export type UnseenResolvedCount = {
	count: number;
};

/** Dados que o service recebe para criar um chamado. */
export type CreateTicketInput = {
	title: string;
	userId: string;
	userName: string;
	photos: UploadedPhoto[];
};

/** Arquivo já validado, pronto para subir ao bucket. */
export type UploadedPhoto = {
	buffer: Buffer;
	contentType: string;
};
