import { boolean, index, pgTable, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';

export const role = pgTable(
	'role',
	{
		id: text('id').primaryKey(),
		name: text('name').notNull(),
		description: text('description'),
		/**
		 * O que o cargo pode fazer, no formato `<módulo>:<ação>` de `PERMISSIONS`.
		 * Guardado como texto separado por vírgula para acompanhar `user.role`,
		 * que o Better Auth já grava assim.
		 */
		permissions: text('permissions').notNull().default(''),
		/** Chave de `ROLE_COLORS`; o tom de cada uma mora na tela. */
		color: text('color').notNull().default('neutral'),
		/** Chave de `ROLE_ICONS`; o desenho de cada um mora na tela. */
		icon: text('icon').notNull().default('pessoa'),
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
