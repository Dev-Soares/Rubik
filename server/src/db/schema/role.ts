import { boolean, index, pgTable, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';

export const role = pgTable(
	'role',
	{
		id: text('id').primaryKey(),
		name: text('name').notNull(),
		description: text('description'),
		/**
		 * Telas que o cargo enxerga, pelas chaves de `SCREENS`. Guardado como
		 * texto separado por vírgula para acompanhar `user.role`, que o Better
		 * Auth já grava assim.
		 */
		screens: text('screens').notNull().default(''),
		/** Cargo de sistema (admin/user): não pode ser renomeado nem removido. */
		isSystem: boolean('is_system').default(false).notNull(),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp('updated_at', { withTimezone: true })
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [
		uniqueIndex('role_name_idx').on(table.name),
		index('role_is_system_idx').on(table.isSystem),
	],
);
