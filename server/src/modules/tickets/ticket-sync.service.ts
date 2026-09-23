import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { z } from 'zod';
import { env } from 'src/config/env';

/**
 * Pergunta ao sistema externo quais chamados já foram concluídos.
 *
 * É o lado de leitura da mesma integração do `TicketWebhookService`, e usa as
 * mesmas variáveis: URL, chave e projeto vêm de `env`, sem configuração nova.
 *
 * Existe porque "concluído no atendimento" não é "disponível para o cliente":
 * a resolução só vale depois que o código subiu. Por isso quem consulta é o
 * deploy (`ticket-sync.ts`), não a API — ver o `preDeployCommand` de
 * `server/railway.json`.
 */

/**
 * Resposta esperada do sistema externo. Validada em vez de confiada: a
 * integração é de outro time, e um shape diferente aqui marcaria chamado
 * errado como resolvido — barulho preferível a dado corrompido.
 */
const resolvedResponseSchema = z.object({
	resolved: z.array(z.string()),
});

@Injectable()
export class TicketSyncService {
	constructor(private readonly logger: PinoLogger) {
		this.logger.setContext(TicketSyncService.name);
	}

	/** Sem URL configurada a consulta é desligada — o template roda sem integração. */
	get isEnabled(): boolean {
		return env.TICKET_WEBHOOK_URL !== '';
	}

	/**
	 * Ids dos chamados deste projeto que o sistema externo dá por concluídos.
	 *
	 * Devolve a lista bruta: filtrar contra o que ainda está aberto aqui é
	 * trabalho de quem chama, e `updateStatus` já ignora repetição.
	 */
	async findResolvedIds(): Promise<string[]> {
		if (!this.isEnabled) {
			return [];
		}

		const url = new URL(env.TICKET_WEBHOOK_URL);
		url.searchParams.set('projectId', env.TICKET_WEBHOOK_PROJECT_ID);

		// `AbortSignal.timeout` pelo mesmo motivo do envio: sistema externo que
		// aceita a conexão e não responde penduraria o deploy inteiro.
		const response = await fetch(url, {
			method: 'GET',
			headers: {
				Accept: 'application/json',
				'x-api-key': env.TICKET_WEBHOOK_API_KEY,
			},
			signal: AbortSignal.timeout(env.TICKET_WEBHOOK_TIMEOUT_MS),
		});

		if (!response.ok) {
			throw new Error(`sistema externo respondeu ${String(response.status)}`);
		}

		const parsed = resolvedResponseSchema.safeParse(await response.json());

		if (!parsed.success) {
			throw new Error(`resposta do sistema externo em formato inesperado: ${parsed.error.message}`);
		}

		this.logger.info({ count: parsed.data.resolved.length }, 'chamados concluídos no atendimento');

		return parsed.data.resolved;
	}
}
