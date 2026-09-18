import { randomUUID } from 'node:crypto';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, count, desc, eq, inArray, isNotNull, isNull, ne } from 'drizzle-orm';
import { PinoLogger } from 'nestjs-pino';
import { isAdmin } from 'src/common/utils';
import { NotificationsService } from 'src/modules/notifications/notifications.service';
import type { CreateNotificationInput } from 'src/modules/notifications/types/notification.types';
import type { Paginated } from 'src/common/types/pagination.types';
import { DB } from 'src/db/db.provider';
import { user } from 'src/db/schema/auth';
import { ticket, ticketPhoto } from 'src/db/schema/ticket';
import type { Database } from 'src/db/types/db.types';
import type { QueryTicketsDto } from 'src/modules/tickets/dto/query-tickets.dto';
import { TicketStorageService } from 'src/modules/tickets/ticket-storage.service';
import {
	TICKET_STATUSES,
	type CreateTicketInput,
	type TicketCounts,
	type TicketEntry,
	type TicketPhoto,
	type TicketStatus,
} from 'src/modules/tickets/types/ticket.types';
import { isTicketStatus } from 'src/modules/tickets/utils';

type TicketRow = typeof ticket.$inferSelect;

/** Mapper da borda: a linha vira o tipo público, com as fotos já assinadas. */
function toEntry(row: TicketRow, photos: TicketPhoto[]): TicketEntry {
	return {
		id: row.id,
		userId: row.userId,
		userName: row.userName,
		title: row.title,
		status: row.status,
		photos,
		createdAt: row.createdAt,
	};
}

@Injectable()
export class TicketsService {
	constructor(
		@Inject(DB) private readonly db: Database,
		private readonly storage: TicketStorageService,
		private readonly notifications: NotificationsService,
		private readonly logger: PinoLogger,
	) {
		this.logger.setContext(TicketsService.name);
	}

	/**
	 * Cria o chamado. As fotos sobem ao bucket antes do INSERT porque o upload
	 * é a parte que falha; se o banco recusar depois, os objetos já enviados
	 * são removidos para não virarem lixo sem dono.
	 */
	async create(input: CreateTicketInput): Promise<TicketEntry> {
		const id = randomUUID();
		const keys = await Promise.all(input.photos.map((photo) => this.storage.upload(id, photo)));

		try {
			return await this.db.transaction(async (tx) => {
				const [row] = await tx
					.insert(ticket)
					.values({
						id,
						userId: input.userId,
						userName: input.userName,
						title: input.title,
					})
					.returning();

				if (!row) {
					throw new Error('falha ao inserir chamado');
				}

				if (keys.length === 0) {
					return toEntry(row, []);
				}

				const photoRows = await tx
					.insert(ticketPhoto)
					.values(
						keys.map((storageKey, index) => ({
							id: randomUUID(),
							ticketId: id,
							storageKey,
							contentType: input.photos[index]?.contentType ?? 'application/octet-stream',
						})),
					)
					.returning();

				return toEntry(row, await this.toPhotos(photoRows));
			});
		} catch (error) {
			await this.discard(keys);
			throw error;
		}
	}

	/**
	 * Lista os chamados, do mais recente para o mais antigo. Todos os usuários
	 * autenticados veem todos os chamados — a tela é geral por decisão de
	 * produto, como a de "Como usar".
	 */
	async findAll(query: QueryTicketsDto): Promise<Paginated<TicketEntry>> {
		const where = query.status ? eq(ticket.status, query.status) : undefined;

		const [rows, [totals]] = await Promise.all([
			this.db
				.select()
				.from(ticket)
				.where(where)
				// `id` desempata linhas do mesmo instante, senão a ordem varia
				// entre páginas e um item pode repetir ou sumir.
				.orderBy(desc(ticket.createdAt), desc(ticket.id))
				.limit(query.limit)
				.offset(query.offset),
			this.db.select({ value: count() }).from(ticket).where(where),
		]);

		const photosByTicket = await this.findPhotosFor(rows.map((row) => row.id));

		return {
			items: rows.map((row) => toEntry(row, photosByTicket.get(row.id) ?? [])),
			total: totals?.value ?? 0,
			limit: query.limit,
			offset: query.offset,
		};
	}

	/**
	 * Quantos chamados há em cada status. Um `GROUP BY` em vez de uma contagem
	 * por aba: a tela mostra os dois números ao mesmo tempo, e duas queries
	 * dariam o mesmo resultado pelo dobro das idas ao banco.
	 *
	 * Status que a integração externa traga e esta versão não conheça fica de
	 * fora do retorno — os contadores existem para as abas que existem.
	 */
	async countByStatus(): Promise<TicketCounts> {
		const rows = await this.db
			.select({ status: ticket.status, value: count() })
			.from(ticket)
			.groupBy(ticket.status);

		const counts = Object.fromEntries(TICKET_STATUSES.map((status) => [status, 0])) as TicketCounts;

		for (const row of rows) {
			if (isTicketStatus(row.status)) {
				counts[row.status] = row.value;
			}
		}

		return counts;
	}

	/**
	 * Muda o status do chamado. Chamada pela integração de atendimento, que não
	 * tem sessão de usuário — a rota é autenticada por chave de API.
	 *
	 * Resolver avisa o autor. O `seenAt` volta a nulo para o aviso reaparecer se
	 * o chamado for reaberto e resolvido de novo, e o filtro por `status`
	 * diferente torna a chamada idempotente: repetir o mesmo status não
	 * reescreve a data nem dispara um segundo aviso.
	 */
	async updateStatus(id: string, status: TicketStatus): Promise<TicketEntry> {
		const [row] = await this.db
			.update(ticket)
			.set({
				status,
				resolvedAt: status === 'resolvido' ? new Date() : null,
				seenAt: null,
			})
			.where(and(eq(ticket.id, id), ne(ticket.status, status)))
			.returning();

		if (!row) {
			return this.findOne(id);
		}

		if (status === 'resolvido') {
			await this.notifications.createManySafe(await this.resolvedNotices(row));
		}

		return toEntry(row, await this.photosOf(row.id));
	}

	/**
	 * Avisos de uma resolução: um para o autor e um para cada administrador.
	 *
	 * O autor sai da lista de admins quando também é admin — receberia dois
	 * avisos do mesmo fato, e o dele é o que fala na segunda pessoa. Chamado de
	 * autor removido (`userId` nulo) ainda avisa os admins.
	 */
	private async resolvedNotices(row: TicketRow): Promise<CreateNotificationInput[]> {
		// O id embute o instante da resolução: reprocessar o mesmo fato não gera
		// um segundo aviso, mas resolver de novo após reabrir gera.
		const event = `${row.id}:${row.resolvedAt?.toISOString() ?? ''}`;

		const notices: CreateNotificationInput[] = [];

		if (row.userId) {
			notices.push({
				id: `ticket.resolved:${event}:${row.userId}`,
				userId: row.userId,
				kind: 'ticket.resolved',
				title: 'Seu chamado foi resolvido',
				body: row.title,
				// Aponta para o chamado: em `/tickets` puro a tela abre em
				// "Abertos", onde o chamado resolvido não aparece.
				link: `/tickets?ticket=${row.id}`,
			});
		}

		for (const adminId of await this.findAdminIds()) {
			if (adminId === row.userId) {
				continue;
			}

			notices.push({
				id: `ticket.resolved:${event}:${adminId}`,
				userId: adminId,
				kind: 'ticket.resolved',
				title: 'Chamado resolvido',
				body: `${row.userName}: ${row.title}`,
				link: `/tickets?ticket=${row.id}`,
			});
		}

		return notices;
	}

	/**
	 * Ids dos administradores. O filtro roda em memória porque `user.role` é
	 * uma lista separada por vírgula: `role = 'admin'` deixaria de fora quem
	 * tem `admin,editor`, e `like '%admin%'` pegaria um cargo chamado
	 * `subadmin`. `isAdmin` é a mesma regra usada pelos guards.
	 */
	private async findAdminIds(): Promise<string[]> {
		const rows = await this.db
			.select({ id: user.id, role: user.role })
			.from(user)
			.where(isNotNull(user.role));

		return rows.filter((row) => isAdmin(row.role)).map((row) => row.id);
	}

	/** Um chamado pelo id, com as fotos assinadas. */
	async findOne(id: string): Promise<TicketEntry> {
		const [row] = await this.db.select().from(ticket).where(eq(ticket.id, id)).limit(1);

		if (!row) {
			throw new NotFoundException('Chamado não encontrado.');
		}

		return toEntry(row, await this.photosOf(row.id));
	}

	/**
	 * Quantos chamados do usuário foram resolvidos sem que ele tenha visto.
	 * Alimenta o aviso ao lado do item na barra lateral.
	 */
	async countUnseenResolvedForUser(userId: string): Promise<number> {
		const [row] = await this.db
			.select({ value: count() })
			.from(ticket)
			.where(and(eq(ticket.userId, userId), eq(ticket.status, 'resolvido'), isNull(ticket.seenAt)));

		return row?.value ?? 0;
	}

	/**
	 * Marca como vistos os chamados resolvidos do usuário. Chamado quando ele
	 * abre a tela — é o que zera o aviso da barra lateral.
	 */
	async markResolvedSeenForUser(userId: string): Promise<number> {
		const rows = await this.db
			.update(ticket)
			.set({ seenAt: new Date() })
			.where(and(eq(ticket.userId, userId), eq(ticket.status, 'resolvido'), isNull(ticket.seenAt)))
			.returning({ id: ticket.id });

		return rows.length;
	}

	/** Fotos de um chamado, já com as URLs assinadas. */
	private async photosOf(ticketId: string): Promise<TicketPhoto[]> {
		return (await this.findPhotosFor([ticketId])).get(ticketId) ?? [];
	}

	/**
	 * Fotos de vários chamados numa consulta só — uma por linha da lista viraria
	 * N+1, e a tela pagina de 20 em 20.
	 */
	private async findPhotosFor(ticketIds: string[]): Promise<Map<string, TicketPhoto[]>> {
		const byTicket = new Map<string, TicketPhoto[]>();

		if (ticketIds.length === 0) {
			return byTicket;
		}

		const rows = await this.db
			.select()
			.from(ticketPhoto)
			.where(inArray(ticketPhoto.ticketId, ticketIds))
			.orderBy(ticketPhoto.createdAt);

		for (const row of rows) {
			const photos = byTicket.get(row.ticketId) ?? [];
			photos.push({
				id: row.id,
				url: await this.storage.signedUrl(row.storageKey),
				contentType: row.contentType,
			});
			byTicket.set(row.ticketId, photos);
		}

		return byTicket;
	}

	/** Assina as URLs de um conjunto de linhas já conhecido. */
	private toPhotos(rows: (typeof ticketPhoto.$inferSelect)[]): Promise<TicketPhoto[]> {
		return Promise.all(
			rows.map(async (row) => ({
				id: row.id,
				url: await this.storage.signedUrl(row.storageKey),
				contentType: row.contentType,
			})),
		);
	}

	/**
	 * Limpa objetos órfãos sem propagar erro: quem chama já está tratando a
	 * falha original, e uma segunda exceção aqui a esconderia.
	 */
	private async discard(keys: string[]): Promise<void> {
		try {
			await this.storage.deleteMany(keys);
		} catch (error) {
			this.logger.error({ err: error, keys }, 'falha ao remover fotos órfãs do bucket');
		}
	}
}
