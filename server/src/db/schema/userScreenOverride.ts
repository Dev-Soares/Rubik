import { boolean, index, pgTable, primaryKey, text, timestamp } from 'drizzle-orm/pg-core';
import { user } from 'src/db/schema/auth';

/**
 * Exceção de tela por usuário, acima do que os cargos dele definem.
 *
 * Só as exceções moram aqui: tela sem linha herda do cargo. `allowed: true`
 * libera uma tela que o cargo não dá; `false` bloqueia uma que ele dá.
 */
export const userScreenOverride = pgTable(
	'user_screen_override',
	{
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		/** Chave de `SCREENS`. */
		screen: text('screen').notNull(),
		allowed: boolean('allowed').notNull(),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp('updated_at', { withTimezone: true })
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [
		primaryKey({ columns: [table.userId, table.screen] }),
		index('user_screen_override_user_id_idx').on(table.userId),
	],
);
