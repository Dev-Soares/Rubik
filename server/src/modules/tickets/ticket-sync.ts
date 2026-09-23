/**
 * Fecha os chamados que o atendimento já concluiu e avisa quem os abriu.
 *
 * Roda no deploy (ver o `CMD` do `server/Dockerfile`), e é aí que está a
 * questão: o sistema externo marca o chamado como concluído quando o
 * desenvolvedor termina, mas o que o cliente pediu só existe para ele depois
 * que o código sobe. Avisar antes disso é avisar de algo que ainda não dá para
 * usar — por isso quem dispara a resolução é o deploy, e não a integração.
 *
 * Usa o contexto do Nest em vez de falar com o banco direto: fechar um chamado
 * grava status, zera `seenAt` e cria aviso para o autor e para cada admin. Essa
 * regra já existe em `TicketsService.updateStatus`, e reescrevê-la aqui seria
 * uma segunda cópia para divergir da primeira.
 *
 * `NestFactory.createApplicationContext` não abre porta nem registra rota: sobe
 * só o container de injeção, executa e sai.
 */
import { NestFactory } from '@nestjs/core';
import { AppModule } from 'src/app.module';
import { TicketsService } from 'src/modules/tickets/tickets.service';

function log(message: string): void {
	process.stdout.write(`[ticket-sync] ${message}\n`);
}

async function main() {
	// `logger: false` cala o banner de boot do Nest: a saída aqui é lida no log
	// do deploy, onde a lista de módulos inicializados é só ruído.
	const app = await NestFactory.createApplicationContext(AppModule, { logger: false });

	try {
		const { resolved } = await app.get(TicketsService).syncResolved();

		if (resolved.length === 0) {
			log('nenhum chamado novo concluído.');
			return;
		}

		log(`${String(resolved.length)} chamado(s) resolvido(s): ${resolved.join(', ')}`);
	} finally {
		await app.close();
	}
}

main().catch((error: unknown) => {
	// eslint-disable-next-line no-console -- o logger do Nest já foi fechado, e isto roda fora da API
	console.error('[ticket-sync] falhou:', error instanceof Error ? error.message : error);
	process.exit(1);
});
