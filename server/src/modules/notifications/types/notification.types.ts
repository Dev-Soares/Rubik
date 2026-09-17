/** Item como o client o recebe. `body` e `link` são opcionais por natureza. */
export type NotificationEntry = {
	id: string;
	kind: string;
	title: string;
	body: string | null;
	link: string | null;
	readAt: Date | null;
	createdAt: Date;
};

/** Dados que a aplicação fornece ao criar um aviso. O resto é do banco. */
export type CreateNotificationInput = {
	/**
	 * Id explícito para tornar a criação idempotente. Derive-o do fato que
	 * originou o aviso (ex: `invoice.overdue:<invoiceId>`) e o próprio id passa
	 * a ser a chave de deduplicação — reprocessar o mesmo evento não gera uma
	 * segunda linha. Omitido, um UUID é gerado.
	 */
	id?: string;
	userId: string;
	kind: string;
	title: string;
	body?: string | null;
	link?: string | null;
};

/** Contagem de não lidas, como retornada pelo endpoint do sino. */
export type UnreadCount = {
	count: number;
};
