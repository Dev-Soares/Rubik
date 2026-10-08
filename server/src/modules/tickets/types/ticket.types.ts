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
 * O chamado nasce `recebido` — ele só existe depois de a central ter aceitado o
 * envio, então "recebido" é literal: está lá, ninguém tratou ainda. Quem grava
 * `resolvido` é a integração externa; não existe tela nesta API que altere isto.
 *
 * O nome espelha o vocabulário da central (`recebido`/`aberto`/`concluido` lá),
 * onde `aberto` significa "a equipe assumiu" — estado que deste lado não existe.
 */
export const TICKET_STATUSES = ['recebido', 'resolvido'] as const;

export type TicketStatus = (typeof TICKET_STATUSES)[number];

export const DEFAULT_TICKET_STATUS: TicketStatus = 'recebido';

/**
 * Nome antigo de `recebido`, aceito só na entrada do PATCH de status.
 *
 * yagni: alias de compatibilidade para integração que ainda não migrou. Em
 * prática a central só empurra `resolvido`, então isto existe para não trocar
 * um 400 por um chamado perdido. Remover quando as instâncias estiverem todas
 * na versão nova.
 */
export const LEGACY_OPEN_STATUS = 'aberto';

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
	/**
	 * Devolutiva do atendimento. `null` significa ausência de resposta escrita —
	 * inclusive em chamado resolvido, que é o caso comum. A tela só desenha o
	 * bloco quando há texto: um bloco vazio afirmaria que responderam nada.
	 */
	resolution: string | null;
	photos: TicketPhoto[];
	createdAt: Date;
};

/** Quantidade de chamados por status, para os contadores das abas. */
export type TicketCounts = Record<TicketStatus, number>;

/** Chamados do usuário resolvidos que ele ainda não viu — o aviso da sidebar. */
export type UnseenResolvedCount = {
	count: number;
};

/**
 * Se o usuário recebe avisos de chamado no sino. Não afeta o contador da
 * barra lateral, que é sobre os chamados dele mesmo.
 */
export type TicketNotificationPreference = {
	enabled: boolean;
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
