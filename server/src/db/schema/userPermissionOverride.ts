import { boolean, index, pgTable, primaryKey, text, timestamp } from 'drizzle-orm/pg-core';
import { user } from 'src/db/schema/auth';

/**
 * Exceção de permissão por usuário, acima do que os cargos dele definem.
 *
 * Só as exceções moram aqui: permissão sem linha herda do cargo.
 * `allowed: true` libera uma que o cargo não dá; `false` bloqueia uma que ele dá.
 */
export const userPermissionOverride = pgTable(
	'user_permission_override',
	{
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		/** Permissão de `PERMISSIONS`, no formato `<módulo>:<ação>`. */
		permission: text('permission').notNull(),
		allowed: boolean('allowed').notNull(),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp('updated_at', { withTimezone: true })
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [
		primaryKey({ columns: [table.userId, table.permission] }),
		index('user_permission_override_user_id_idx').on(table.userId),
	],
);
