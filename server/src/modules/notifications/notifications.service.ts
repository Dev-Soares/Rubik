import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, count, desc, eq, isNull, type SQL } from 'drizzle-orm';
import { PinoLogger } from 'nestjs-pino';
import type { Paginated } from 'src/common/types/pagination.types';
import { DB } from 'src/db/db.provider';
import { notification } from 'src/db/schema/notification';
import type { Database } from 'src/db/types/db.types';
import type { QueryNotificationsDto } from 'src/modules/notifications/dto/query-notifications.dto';
import type {
	CreateNotificationInput,
	NotificationEntry,
} from 'src/modules/notifications/types/notification.types';
import { toValues } from 'src/modules/notifications/utils';

type NotificationRow = typeof notification.$inferSelect;

/** O client não usa `userId` nem `updatedAt`: a lista já é a do próprio usuário. */
function toEntry(row: NotificationRow): NotificationEntry {
	return {
		id: row.id,
		kind: row.kind,
		title: row.title,
		body: row.body,
		link: row.link,
		readAt: row.readAt,
		createdAt: row.createdAt,
	};
}

/**
 * Teto de linhas por INSERT. Cada linha ocupa 6 parâmetros de bind e o
 * Postgres aceita 65535 por statement — 500 deixa folga confortável.
 */
const INSERT_CHUNK_SIZE = 500;

@Injectable()
export class NotificationsService {
	constructor(
		@Inject(DB) private readonly db: Database,
		private readonly logger: PinoLogger,
	) {
		this.logger.setContext(NotificationsService.name);
	}

	/**
	 * Cria um aviso. Chamado pelos outros módulos, não por uma rota HTTP:
	 * quem notifica é a aplicação, nunca o usuário.
	 */
	async create(input: CreateNotificationInput): Promise<NotificationEntry> {
		const [row] = await this.db.insert(notification).values(toValues(input)).returning();
		if (!row) {
			throw new Error('falha ao inserir notificação');
		}
		return toEntry(row);
	}

	/**
	 * Cria vários avisos de uma vez, ignorando ids que já existam.
	 *
	 * Retorna apenas as linhas criadas de fato, o que permite ao chamador saber
	 * se o evento era novo — com ids derivados do fato (ver
	 * `CreateNotificationInput.id`), um retorno vazio significa que aquele
	 * evento já havia sido notificado.
	 */
	async createMany(inputs: CreateNotificationInput[]): Promise<NotificationEntry[]> {
		if (inputs.length === 0) {
			return [];
		}

		const values = inputs.map(toValues);

		return this.db.transaction(async (tx) => {
			const created: NotificationEntry[] = [];
			for (let start = 0; start < values.length; start += INSERT_CHUNK_SIZE) {
				const chunk = values.slice(start, start + INSERT_CHUNK_SIZE);
				const rows = await tx
					.insert(notification)
					.values(chunk)
					.onConflictDoNothing({ target: notification.id })
					.returning();
				created.push(...rows.map(toEntry));
			}
			return created;
		});
	}

	/**
	 * Cria avisos sem propagar erro. Use quando a notificação é um efeito
	 * colateral: falhar ao avisar não pode desfazer a operação que já foi
	 * concluída com sucesso.
	 */
	async createManySafe(inputs: CreateNotificationInput[]): Promise<void> {
		try {
			await this.createMany(inputs);
		} catch (error) {
			this.logger.error({ err: error, count: inputs.length }, 'falha ao criar notificações');
		}
	}

	/** Lista os avisos do usuário, do mais recente para o mais antigo. */
	async findAllForUser(
		userId: string,
		query: QueryNotificationsDto,
	): Promise<Paginated<NotificationEntry>> {
		const filters: SQL[] = [eq(notification.userId, userId)];

		if (query.unreadOnly) {
			filters.push(isNull(notification.readAt));
		}
		if (query.kind) {
			filters.push(eq(notification.kind, query.kind));
		}

		const where = and(...filters);

		const [rows, [totals]] = await Promise.all([
			this.db
				.select()
				.from(notification)
				.where(where)
				// `id` desempata linhas do mesmo instante, senão a ordem varia
				// entre páginas e um item pode repetir ou sumir.
				.orderBy(desc(notification.createdAt), desc(notification.id))
				.limit(query.limit)
				.offset(query.offset),
			this.db.select({ value: count() }).from(notification).where(where),
		]);

		return {
			items: rows.map(toEntry),
			total: totals?.value ?? 0,
			limit: query.limit,
			offset: query.offset,
		};
	}

	/** Quantas não lidas o usuário tem. Alimenta o contador do sino. */
	async countUnreadForUser(userId: string): Promise<number> {
		const [row] = await this.db
			.select({ value: count() })
			.from(notification)
			.where(and(eq(notification.userId, userId), isNull(notification.readAt)));
		return row?.value ?? 0;
	}

	/**
	 * Marca uma notificação como lida. O filtro por `userId` é o que impede um
	 * usuário de marcar a notificação de outro — sem ele o id bastaria.
	 * Relê sem efeito se já estava lida, preservando o `readAt` original.
	 */
	async markRead(id: string, userId: string): Promise<NotificationEntry> {
		const [row] = await this.db
			.update(notification)
			.set({ readAt: new Date() })
			.where(
				and(eq(notification.id, id), eq(notification.userId, userId), isNull(notification.readAt)),
			)
			.returning();

		if (row) {
			return toEntry(row);
		}

		// Sem linha atualizada: ou não existe/não é do usuário, ou já estava
		// lida. Só o segundo caso é sucesso, então confirma antes de recusar.
		const [existing] = await this.db
			.select()
			.from(notification)
			.where(and(eq(notification.id, id), eq(notification.userId, userId)))
			.limit(1);

		if (!existing) {
			throw new NotFoundException('Notificação não encontrada.');
		}
		return toEntry(existing);
	}

	/** Marca todas as não lidas do usuário como lidas e devolve quantas foram. */
	async markAllRead(userId: string): Promise<number> {
		const rows = await this.db
			.update(notification)
			.set({ readAt: new Date() })
			.where(and(eq(notification.userId, userId), isNull(notification.readAt)))
			.returning({ id: notification.id });
		return rows.length;
	}
}
