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
 *
 * `resolutions` é OPCIONAL de propósito. É o formato que traz a devolutiva, e
 * exigi-lo faria toda instância de atendimento que ainda não subiu o campo
 * reprovar na validação — o deploy inteiro falharia por causa de um texto que é
 * opcional por natureza. Ausente, o sync segue por `resolved` e os chamados
 * fecham sem devolutiva, que é o comportamento de antes desta feature.
 */
const resolvedResponseSchema = z.object({
	resolved: z.array(z.string()),
	resolutions: z
		.array(
			z.object({
				externalId: z.string(),
				resolution: z.string().nullable(),
			}),
		)
		.optional(),
});

/** Um chamado concluído no atendimento, com a devolutiva quando há. */
export type ResolvedTicket = {
	/** O id DESTE sistema — do outro lado ele é o `externalId`. */
	id: string;
	resolution: string | null;
};

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
	 * Chamados deste projeto que o sistema externo dá por concluídos, com a
	 * devolutiva de cada um quando o atendimento a escreveu.
	 *
	 * Devolve a lista bruta: filtrar contra o que ainda está aberto aqui é
	 * trabalho de quem chama, e `updateStatus` já ignora repetição.
	 */
	async findResolved(): Promise<ResolvedTicket[]> {
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

		const { resolved, resolutions } = parsed.data;

		this.logger.info(
			{ count: resolved.length, withResolution: resolutions !== undefined },
			'chamados concluídos no atendimento',
		);

		// `resolved` continua sendo a FONTE da lista mesmo quando `resolutions`
		// veio: é o campo que o contrato sempre garantiu, e um atendimento que
		// mandasse os dois divergentes fecharia, pelo primeiro, o conjunto que ele
		// próprio declarou. `resolutions` só acrescenta o texto.
		const byId = new Map(resolutions?.map((item) => [item.externalId, item.resolution]));

		return resolved.map((id) => ({ id, resolution: byId.get(id) ?? null }));
	}
}
