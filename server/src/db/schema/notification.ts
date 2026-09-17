import { index, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { user } from 'src/db/schema/auth';

/**
 * Aviso destinado a um usuário. Diferente do `auditLog`, que registra o que
 * já aconteceu para consulta posterior, aqui o alvo é o destinatário: a linha
 * existe para ser lida, e some junto com ele.
 *
 * `userId` é FK com `cascade` — notificação de usuário removido não tem quem
 * a leia. `kind` é texto livre para que cada projeto derivado defina os seus
 * tipos sem migration; a tela usa esse campo para escolher ícone e destaque.
 */
export const notification = pgTable(
	'notification',
	{
		id: text('id').primaryKey(),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		/** Tipo do aviso, definido pela aplicação (ex: `user.invited`). */
		kind: text('kind').notNull(),
		title: text('title').notNull(),
		body: text('body'),
		/** Rota do client para onde o item leva ao ser clicado. */
		link: text('link'),
		/** Nulo enquanto não lida — é o que o contador do sino conta. */
		readAt: timestamp('read_at', { withTimezone: true }),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp('updated_at', { withTimezone: true })
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [index('notification_user_id_created_at_idx').on(table.userId, table.createdAt)],
);
