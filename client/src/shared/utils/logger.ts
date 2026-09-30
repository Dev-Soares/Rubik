/**
 * Log do frontend com um ponto de saída único.
 *
 * Em dev vai para o console. Em produção o console não é lido por ninguém —
 * `report` é o lugar de plugar o coletor (Sentry, Datadog) quando o projeto
 * derivado tiver um. Enquanto não tem, produção fica silenciosa de propósito:
 * poluir o console do usuário não ajuda a investigar nada.
 */

type LogContext = Record<string, unknown>;

type Report = {
	message: string;
	error?: unknown;
	context: LogContext;
};

/**
 * Ponto de extensão. Um projeto derivado troca o corpo por
 * `Sentry.captureException(entry.error, { extra: entry.context })` e nada mais
 * muda — nenhum componente conhece o coletor.
 */
function report(entry: Report): void {
	void entry;
}

export function logError(message: string, error: unknown, context: LogContext = {}): void {
	if (import.meta.env.DEV) {
		console.error(`[erro] ${message}`, { error, ...context });
		return;
	}

	report({ message, error, context });
}

export function logWarn(message: string, context: LogContext = {}): void {
	if (import.meta.env.DEV) {
		console.warn(`[aviso] ${message}`, context);
		return;
	}

	report({ message, context });
}
