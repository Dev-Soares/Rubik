import { randomUUID } from 'node:crypto';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, count, desc, eq, inArray, isNotNull, isNull, lt, ne, sql } from 'drizzle-orm';
import { PinoLogger } from 'nestjs-pino';
import { isAdmin } from 'src/common/utils';
import { env } from 'src/config/env';
import { NotificationsService } from 'src/modules/notifications/notifications.service';
import type { CreateNotificationInput } from 'src/modules/notifications/types/notification.types';
import type { Paginated } from 'src/common/types/pagination.types';
import { DB } from 'src/db/db.provider';
import { user } from 'src/db/schema/auth';
import { ticket, ticketNotificationOptOut, ticketPhoto } from 'src/db/schema/ticket';
import type { Database } from 'src/db/types/db.types';
import type { QueryTicketsDto } from 'src/modules/tickets/dto/query-tickets.dto';
import { TicketStorageService } from 'src/modules/tickets/ticket-storage.service';
import { TicketSyncService } from 'src/modules/tickets/ticket-sync.service';
import { TicketWebhookService } from 'src/modules/tickets/ticket-webhook.service';
import {
	LEGACY_OPEN_STATUS,
	TICKET_STATUSES,
	type CreateTicketInput,
	type TicketCounts,
	type TicketEntry,
	type TicketPhoto,
	type TicketStatus,
} from 'src/modules/tickets/types/ticket.types';
import { isTicketStatus } from 'src/modules/tickets/utils';

type TicketRow = typeof ticket.$inferSelect;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Mapper da borda: a linha vira o tipo público, com as fotos já assinadas. */
function toEntry(row: TicketRow, photos: TicketPhoto[]): TicketEntry {
	return {
		id: row.id,
		userId: row.userId,
		userName: row.userName,
		title: row.title,
		status: row.status,
		resolution: row.resolution,
		photos,
		createdAt: row.createdAt,
	};
}

@Injectable()
export class TicketsService {
	constructor(
		@Inject(DB) private readonly db: Database,
		private readonly storage: TicketStorageService,
		private readonly webhook: TicketWebhookService,
		private readonly sync: TicketSyncService,
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

				const photoRows =
					keys.length === 0
						? []
						: await tx
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

				const entry = toEntry(row, await this.toPhotos(photoRows));

				/*
				 * O envio roda dentro da transação porque falhar nele cancela a
				 * abertura: lançar aqui desfaz o INSERT, e o `catch` externo
				 * remove as fotos do bucket. Fora da transação, o chamado ficaria
				 * gravado sem ter chegado ao atendimento.
				 *
				 * Precisa vir depois do INSERT: o corpo leva as URLs assinadas,
				 * que só existem com as linhas de foto criadas.
				 */
				await this.webhook.send(entry);

				return entry;
			});
		} catch (error) {
			await this.discard(keys);
			throw error;
		}
	}

	/**
	 * Lista os chamados, do mais recente para o mais antigo, sem filtrar por
	 * autor: a aba é restrita a administrador, e quem restringe é o
	 * `@Roles('admin')` do controller.
	 *
	 * Não copie esta ausência de filtro para um módulo cujo controller não tenha
	 * a mesma restrição — ali ela vaza o dado de um usuário para outro.
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
	async updateStatus(
		id: string,
		status: TicketStatus | typeof LEGACY_OPEN_STATUS,
		resolution: string | null = null,
	): Promise<TicketEntry> {
		// Normaliza o alias aqui, na entrada: a partir desta linha só existem os
		// dois estados atuais, e nada abaixo precisa conhecer o nome antigo.
		const next: TicketStatus = status === LEGACY_OPEN_STATUS ? 'recebido' : status;

		const [row] = await this.db
			.update(ticket)
			.set({
				status: next,
				resolvedAt: next === 'resolvido' ? new Date() : null,
				seenAt: null,
				// Reabrir limpa a devolutiva: ela respondia a uma resolução que
				// deixou de valer, e mantê-la faria a tela exibir a resposta de um
				// chamado que voltou a estar aberto.
				resolution: next === 'resolvido' ? resolution : null,
			})
			.where(and(eq(ticket.id, id), ne(ticket.status, next)))
			.returning();

		if (!row) {
			return this.findOne(id);
		}

		if (next === 'resolvido') {
			await this.notifications.createManySafe(await this.resolvedNotices(row));
		}

		return toEntry(row, await this.photosOf(row.id));
	}

	/**
	 * Fecha os chamados recebidos que o sistema externo já deu por concluídos.
	 *
	 * Roda no deploy, não na API: o usuário só deve ser avisado quando o que
	 * ele pediu estiver em produção, e "concluído no atendimento" acontece
	 * antes disso. Ver `src/modules/tickets/ticket-sync.ts`.
	 *
	 * A interseção é feita aqui e não delegada ao externo porque a lista de
	 * recebidos é a nossa verdade: o externo pode devolver chamado de outra
	 * instância, ou um que já fechamos num deploy anterior.
	 */
	async syncResolved(): Promise<{ resolved: string[] }> {
		const resolved = await this.sync.findResolved();

		if (resolved.length === 0) {
			return { resolved: [] };
		}

		const byId = new Map(resolved.map((item) => [item.id, item.resolution]));
		const ids = [...byId.keys()];

		const open = await this.db
			.select({ id: ticket.id })
			.from(ticket)
			.where(and(eq(ticket.status, 'recebido'), inArray(ticket.id, ids)));

		// Em série, não em `Promise.all`: cada `updateStatus` grava notificação
		// para o autor e para todos os admins, e um lote grande em paralelo
		// abriria uma conexão por chamado no pool.
		for (const row of open) {
			await this.updateStatus(row.id, 'resolvido', byId.get(row.id) ?? null);
		}

		// Segundo passo, para os que JÁ estavam resolvidos. Sem ele a devolutiva
		// quase nunca chegaria: no atendimento, a tarefa é concluída (e o chamado
		// fecha) antes de alguém escrever a resposta, então o texto costuma nascer
		// DEPOIS do deploy que fechou o chamado aqui. `updateStatus` não serve —
		// seu `ne(status, next)` ignora, de propósito, quem já está no estado.
		await this.backfillResolutions(byId, new Set(open.map((row) => row.id)));

		return { resolved: open.map((row) => row.id) };
	}

	/**
	 * Grava a devolutiva dos chamados que já estavam resolvidos.
	 *
	 * NÃO notifica: o aviso é sobre o chamado ter sido resolvido, e esse fato já
	 * foi anunciado no deploy que o fechou. Um segundo aviso dias depois, porque
	 * o atendimento escreveu o texto, soaria como uma segunda resolução.
	 *
	 * Não toca em `seenAt` pelo mesmo motivo: o contador da barra lateral conta
	 * resolução não vista, e zerá-lo faria o chamado reaparecer como novidade.
	 *
	 * Só grava o que MUDOU (`ne`), senão todo deploy reescreveria a mesma linha
	 * para todo chamado resolvido do histórico.
	 */
	private async backfillResolutions(
		byId: Map<string, string | null>,
		justClosed: Set<string>,
	): Promise<void> {
		for (const [id, resolution] of byId) {
			// Quem acabou de fechar já recebeu o texto no `updateStatus`.
			if (justClosed.has(id) || resolution === null) {
				continue;
			}
			await this.db
				.update(ticket)
				.set({ resolution })
				.where(
					and(
						eq(ticket.id, id),
						eq(ticket.status, 'resolvido'),
						// `IS DISTINCT FROM` e não `<>`: em SQL, `NULL <> 'texto'` é
						// NULL (não TRUE), então o `ne` não casaria com a linha que
						// ainda não tem devolutiva — justamente o caso que este passo
						// existe para preencher.
						sql`${ticket.resolution} is distinct from ${resolution}`,
					),
				);
		}
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

		const silenced = await this.findSilencedIds();

		const notices: CreateNotificationInput[] = [];

		if (row.userId && !silenced.has(row.userId)) {
			notices.push({
				id: `ticket.resolved:${event}:${row.userId}`,
				userId: row.userId,
				kind: 'ticket.resolved',
				title: 'Seu chamado foi resolvido',
				body: row.title,
				// Aponta para o chamado: em `/tickets` puro a tela abre em
				// "Recebidos", onde o chamado resolvido não aparece.
				link: `/tickets?ticket=${row.id}`,
			});
		}

		for (const adminId of await this.findAdminIds()) {
			if (adminId === row.userId || silenced.has(adminId)) {
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
	 *
	 * yagni: varrer `user` em memória basta na escala de uma empresa (milhares
	 * de contas). Se passar disso, o caminho é normalizar o cargo numa tabela
	 * `user_role` e trocar a varredura por um JOIN — o CSV é herança do formato
	 * que o Better Auth grava, não uma escolha nossa.
	 */
	private async findAdminIds(): Promise<string[]> {
		const rows = await this.db
			.select({ id: user.id, role: user.role })
			.from(user)
			.where(isNotNull(user.role));

		return rows.filter((row) => isAdmin(row.role)).map((row) => row.id);
	}

	/**
	 * Apaga os chamados resolvidos há mais de `TICKET_RETENTION_DAYS` dias.
	 *
	 * O chamado é registro operacional, não histórico: depois de resolvido e
	 * visto, ninguém volta nele. Sem a limpeza a tabela e o bucket crescem para
	 * sempre — e o bucket é o que custa.
	 *
	 * A janela conta do `resolvedAt`, não do `createdAt`: chamado antigo que
	 * ficou meses aberto e acabou de ser resolvido tem o mesmo mês de vida que
	 * qualquer outro recém-resolvido.
	 */
	async purgeResolved(): Promise<{ deleted: number }> {
		const cutoff = new Date(Date.now() - env.TICKET_RETENTION_DAYS * MS_PER_DAY);

		const expired = await this.db
			.select({ id: ticket.id })
			.from(ticket)
			.where(and(eq(ticket.status, 'resolvido'), lt(ticket.resolvedAt, cutoff)));

		if (expired.length === 0) {
			return { deleted: 0 };
		}

		const ids = expired.map((row) => row.id);

		/*
		 * As fotos saem do bucket antes do DELETE: o cascade apaga a linha de
		 * `ticket_photo` e, com ela, a única referência à chave do objeto — que
		 * ficaria órfã no bucket para sempre.
		 */
		const photos = await this.db
			.select({ storageKey: ticketPhoto.storageKey })
			.from(ticketPhoto)
			.where(inArray(ticketPhoto.ticketId, ids));

		// `discard` engole o erro de propósito: falha no bucket não pode travar
		// a limpeza do banco, senão a tabela cresce enquanto o S3 estiver ruim.
		await this.discard(photos.map((row) => row.storageKey));

		const removed = await this.db
			.delete(ticket)
			.where(inArray(ticket.id, ids))
			.returning({ id: ticket.id });

		this.logger.info(
			{ count: removed.length, olderThanDays: env.TICKET_RETENTION_DAYS },
			'chamados resolvidos removidos',
		);

		return { deleted: removed.length };
	}

	/**
	 * Ids de quem desligou os avisos de chamado. Consulta única por resolução —
	 * a alternativa seria um `SELECT` por destinatário.
	 */
	private async findSilencedIds(): Promise<Set<string>> {
		const rows = await this.db
			.select({ userId: ticketNotificationOptOut.userId })
			.from(ticketNotificationOptOut);

		return new Set(rows.map((row) => row.userId));
	}

	/** Se o usuário recebe avisos de chamado. */
	async isNotificationEnabled(userId: string): Promise<boolean> {
		const [row] = await this.db
			.select({ userId: ticketNotificationOptOut.userId })
			.from(ticketNotificationOptOut)
			.where(eq(ticketNotificationOptOut.userId, userId))
			.limit(1);

		return !row;
	}

	/**
	 * Liga ou desliga os avisos de chamado do usuário.
	 *
	 * Ligar remove a linha; desligar a insere. `onConflictDoNothing` porque
	 * desligar duas vezes é a mesma coisa que desligar uma.
	 */
	async setNotificationEnabled(userId: string, enabled: boolean): Promise<boolean> {
		if (enabled) {
			await this.db
				.delete(ticketNotificationOptOut)
				.where(eq(ticketNotificationOptOut.userId, userId));

			return true;
		}

		await this.db.insert(ticketNotificationOptOut).values({ userId }).onConflictDoNothing();

		return false;
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
