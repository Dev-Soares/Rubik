import { randomUUID } from 'node:crypto';
import type { notification } from 'src/db/schema/notification';
import type { CreateNotificationInput } from 'src/modules/notifications/types/notification.types';

/**
 * Normaliza a entrada para o formato do INSERT. `body` e `link` viram `null`
 * explícito para que `create` e `createMany` gravem linhas idênticas — em
 * lote, chaves ausentes em parte dos objetos quebram o statement único.
 */
export function toValues(input: CreateNotificationInput): typeof notification.$inferInsert {
	return {
		id: input.id ?? randomUUID(),
		userId: input.userId,
		kind: input.kind,
		title: input.title,
		body: input.body ?? null,
		link: input.link ?? null,
	};
}
