import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { and, count, desc, eq, gte, ilike, lte, or, type SQL } from 'drizzle-orm';
import { PinoLogger } from 'nestjs-pino';
import type { Paginated } from 'src/common/types/pagination.types';
import { DB } from 'src/db/db.provider';
import { auditLog } from 'src/db/schema/audit';
import type { Database } from 'src/db/types/db.types';
import type { QueryAuditDto } from 'src/modules/audit/dto/query-audit.dto';
import type {
	AuditAction,
	AuditLogEntry,
	RecordAuditInput,
} from 'src/modules/audit/types/audit.types';
import { endOfDay, toLikePattern } from 'src/modules/audit/utils';

type AuditRow = typeof auditLog.$inferSelect;

/** `action` é texto no banco; o conjunto de valores é garantido na escrita. */
function toEntry(row: AuditRow): AuditLogEntry {
	return { ...row, action: row.action as AuditAction };
}

@Injectable()
export class AuditService {
	constructor(
		@Inject(DB) private readonly db: Database,
		private readonly logger: PinoLogger,
	) {
		this.logger.setContext(AuditService.name);
	}

	/**
	 * Grava a movimentação. Nunca lança: falhar o log não pode derrubar a
	 * requisição que já foi concluída com sucesso.
	 */
	async record(input: RecordAuditInput): Promise<void> {
		try {
			await this.db.insert(auditLog).values({ id: randomUUID(), ...input });
		} catch (error) {
			this.logger.error({ err: error, path: input.path }, 'falha ao registrar auditoria');
		}
	}

	async findAll(query: QueryAuditDto): Promise<Paginated<AuditLogEntry>> {
		const filters: SQL[] = [];

		const search = query.search?.trim();
		if (search) {
			const pattern = toLikePattern(search);
			const match = or(ilike(auditLog.userName, pattern), ilike(auditLog.userEmail, pattern));
			if (match) {
				filters.push(match);
			}
		}

		if (query.userId) {
			filters.push(eq(auditLog.userId, query.userId));
		}
		if (query.action) {
			filters.push(eq(auditLog.action, query.action));
		}
		if (query.entity) {
			filters.push(eq(auditLog.entity, query.entity));
		}
		if (query.from) {
			filters.push(gte(auditLog.createdAt, new Date(query.from)));
		}
		if (query.to) {
			filters.push(lte(auditLog.createdAt, endOfDay(query.to)));
		}

		const where = filters.length > 0 ? and(...filters) : undefined;

		const [rows, [totals]] = await Promise.all([
			this.db
				.select()
				.from(auditLog)
				.where(where)
				.orderBy(desc(auditLog.createdAt))
				.limit(query.limit)
				.offset(query.offset),
			this.db.select({ value: count() }).from(auditLog).where(where),
		]);

		return {
			items: rows.map(toEntry),
			total: totals?.value ?? 0,
			limit: query.limit,
			offset: query.offset,
		};
	}
}
