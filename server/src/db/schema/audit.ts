import { index, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

/**
 * Registro de uso: uma linha por mutação bem-sucedida feita via HTTP.
 * Não guarda o corpo da requisição — só quem fez, o quê e sobre qual recurso.
 *
 * `userId` não é FK: o log precisa sobreviver à remoção do usuário. `userName`
 * e `userEmail` são copiados no momento da ação pelo mesmo motivo.
 */
export const auditLog = pgTable(
	'audit_log',
	{
		id: text('id').primaryKey(),
		userId: text('user_id'),
		userName: text('user_name').notNull(),
		userEmail: text('user_email').notNull(),
		/** `create` | `update` | `delete`, derivado do método HTTP. */
		action: text('action').notNull(),
		/** Recurso afetado, pela primeira parte da rota (ex: `users`, `roles`). */
		entity: text('entity').notNull(),
		/** Id do recurso, quando a rota tem `:id`. */
		entityId: text('entity_id'),
		method: text('method').notNull(),
		path: text('path').notNull(),
		ipAddress: text('ip_address'),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
	},
	(table) => [
		index('audit_log_created_at_idx').on(table.createdAt),
		index('audit_log_user_id_idx').on(table.userId),
		index('audit_log_entity_idx').on(table.entity),
	],
);
