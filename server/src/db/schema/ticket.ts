import { index, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { user } from 'src/db/schema/auth';

/**
 * Chamado aberto por um usuário. Deliberadamente raso: título e fotos, nada
 * mais. Não há status, prioridade nem edição — o ticket nasce e é lido.
 *
 * `userId` não é FK com cascade como em `notification`: o chamado precisa
 * sobreviver à remoção de quem o abriu, então `userName` é copiado no momento
 * da criação, pelo mesmo motivo do `auditLog`.
 */
export const ticket = pgTable(
	'ticket',
	{
		id: text('id').primaryKey(),
		userId: text('user_id').references(() => user.id, { onDelete: 'set null' }),
		/** Copiado na criação para o chamado sobreviver ao usuário. */
		userName: text('user_name').notNull(),
		title: text('title').notNull(),
		/**
		 * `aberto` | `resolvido`. Texto e não enum do Postgres: alterar um enum
		 * exige migration só para acrescentar valor, e quem fecha o chamado é
		 * uma integração externa que pode trazer estados novos.
		 *
		 * Nada no sistema escreve `resolvido` — a resolução vem de fora.
		 */
		status: text('status').notNull().default('aberto'),
		/**
		 * Quando o chamado foi resolvido. Nulo enquanto aberto — é o que separa
		 * "nunca foi resolvido" de "resolvido e já visto".
		 */
		resolvedAt: timestamp('resolved_at', { withTimezone: true }),
		/**
		 * Quando o autor viu a resolução. Enquanto nulo com `resolvedAt`
		 * preenchido, o chamado conta no aviso da sidebar — é o par que o
		 * contador de "resolvidos não vistos" compara.
		 */
		seenAt: timestamp('seen_at', { withTimezone: true }),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp('updated_at', { withTimezone: true })
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [
		index('ticket_created_at_idx').on(table.createdAt),
		index('ticket_user_id_idx').on(table.userId),
		// A lista filtra por status e ordena por data — o índice composto cobre
		// os dois passos da mesma query.
		index('ticket_status_created_at_idx').on(table.status, table.createdAt),
		// O contador do aviso filtra pelo autor e pelo que ainda não foi visto.
		index('ticket_user_id_seen_at_idx').on(table.userId, table.seenAt),
	],
);

/**
 * Foto anexada a um chamado, até o teto de `MAX_TICKET_PHOTOS`. Tabela
 * separada em vez de três colunas no `ticket`: o anexo é opcional e variável,
 * e colunas nulas numeradas (`photo1Key`, `photo2Key`) espalham a regra de
 * "quantas cabem" por toda query que as toca.
 *
 * `storageKey` é o caminho do objeto no bucket — a URL não é guardada porque
 * é assinada e expira; quem a gera é o `TicketStorageService`.
 */
export const ticketPhoto = pgTable(
	'ticket_photo',
	{
		id: text('id').primaryKey(),
		ticketId: text('ticket_id')
			.notNull()
			.references(() => ticket.id, { onDelete: 'cascade' }),
		/** Caminho do objeto no bucket (ex: `tickets/<ticketId>/<uuid>.jpg`). */
		storageKey: text('storage_key').notNull(),
		contentType: text('content_type').notNull(),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
	},
	(table) => [index('ticket_photo_ticket_id_idx').on(table.ticketId)],
);
