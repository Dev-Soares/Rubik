import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { env } from 'src/config/env';
import type { TicketEntry } from 'src/modules/tickets/types/ticket.types';

/**
 * Envia cada chamado aberto ao sistema externo de atendimento.
 *
 * Destino, chave e projeto vêm de `env`: este template é clonado por vários
 * projetos, e cada instância aponta para o seu sem precisar de tela nem de
 * migration.
 *
 * Falha aqui cancela a abertura: o chamado existe para chegar ao atendimento,
 * e um registro que só existe do nosso lado seria pior que o erro visível.
 */
@Injectable()
export class TicketWebhookService {
	constructor(private readonly logger: PinoLogger) {
		this.logger.setContext(TicketWebhookService.name);
	}

	/** Sem URL configurada o envio é desligado — o template roda sem integração. */
	get isEnabled(): boolean {
		return env.TICKET_WEBHOOK_URL !== '';
	}

	async send(ticket: TicketEntry): Promise<void> {
		if (!this.isEnabled) {
			return;
		}

		// `AbortSignal.timeout` evita que a abertura fique pendurada quando o
		// sistema externo aceita a conexão e não responde.
		const response = await fetch(env.TICKET_WEBHOOK_URL, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'x-api-key': env.TICKET_WEBHOOK_API_KEY,
			},
			body: JSON.stringify({
				projectId: env.TICKET_WEBHOOK_PROJECT_ID,
				ticketId: ticket.id,
				title: ticket.title,
				// Endereço de retorno: é aqui que o sistema externo devolve a
				// resolução, em `PATCH <originSystem>/tickets/<ticketId>/status`.
				// Mesmo host público da API, já configurado para o Better Auth.
				originSystem: env.BETTER_AUTH_URL,
				createdAt: ticket.createdAt,
				// URLs assinadas e temporárias: o sistema externo precisa baixar
				// as imagens logo, não guardar o link.
				photos: ticket.photos.map((photo) => ({
					url: photo.url,
					contentType: photo.contentType,
				})),
			}),
			signal: AbortSignal.timeout(env.TICKET_WEBHOOK_TIMEOUT_MS),
		}).catch((error: unknown) => {
			this.logger.error({ err: error, ticketId: ticket.id }, 'falha ao enviar chamado');
			throw new ServiceUnavailableException(
				'Não foi possível enviar seu chamado ao atendimento. Tente novamente em instantes.',
			);
		});

		if (!response.ok) {
			this.logger.error(
				{ status: response.status, ticketId: ticket.id },
				'sistema externo recusou o chamado',
			);
			throw new ServiceUnavailableException(
				'O atendimento não aceitou seu chamado. Tente novamente em instantes.',
			);
		}
	}
}
