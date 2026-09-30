import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PinoLogger } from 'nestjs-pino';
import { TicketsService } from 'src/modules/tickets/tickets.service';

/**
 * Agenda a limpeza dos chamados fora da janela de retenção.
 *
 * Só o gatilho mora aqui — a regra de o que apagar, e de tirar as fotos do
 * bucket antes do DELETE, é do `TicketsService.purgeResolved`.
 *
 * De madrugada porque a limpeza apaga em lote e assina nada: fora do horário
 * de uso, ninguém disputa conexão do pool com ela.
 */
@Injectable()
export class TicketCleanupService {
	constructor(
		private readonly tickets: TicketsService,
		private readonly logger: PinoLogger,
	) {
		this.logger.setContext(TicketCleanupService.name);
	}

	/**
	 * Nunca propaga erro: uma exceção aqui sobe para o timer do
	 * `@nestjs/schedule`, que a trata como falha não capturada — e a aplicação
	 * inteira cairia por causa de uma limpeza. Falhar hoje só adia o corte para
	 * amanhã, porque a janela é por data e não por execução.
	 */
	@Cron(CronExpression.EVERY_DAY_AT_4AM, { name: 'ticket-cleanup' })
	async purgeExpired(): Promise<void> {
		try {
			await this.tickets.purgeResolved();
		} catch (error) {
			this.logger.error({ err: error }, 'falha ao limpar chamados resolvidos');
		}
	}
}
