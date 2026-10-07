import { index, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

/**
 * Registro de uso: uma linha por mutação bem-sucedida feita via HTTP.
 * Não guarda o corpo da requisição — só quem fez, o quê e sobre qual recurso.
 *
 * `userId` não é FK, e `userName`/`userEmail` são copiados no momento da ação:
 * o registro tem de continuar legível mesmo que a conta mude de nome ou de
 * e-mail depois. (Conta não é removida — ver `users.controller.ts` —, mas o
 * registro também não deve depender disso.)
 *
 * yagni: não há limpeza automática, ao contrário de `ticket`. É deliberado —
 * registro de uso é histórico, e quanto tempo guardar é decisão de negócio, não
 * de código. A tabela cresce uma linha por mutação: se o volume incomodar,
 * acrescente um `@Cron` de retenção no espelho de `purgeResolved`, com a janela
 * em `env`.
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
