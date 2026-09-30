import {
	type CallHandler,
	type ExecutionContext,
	Injectable,
	type NestInterceptor,
} from '@nestjs/common';
import type { Request } from 'express';
import { PinoLogger } from 'nestjs-pino';
import type { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

/** Acima disto a requisição é lenta o bastante para o usuário perceber. */
const SLOW_REQUEST_MS = 1000;
/** Acima disto já não é lentidão, é incidente: sobe para `error`. */
const CRITICAL_REQUEST_MS = 5000;

type RequestWithId = Request & { id?: string; user?: { id?: string } };

/**
 * Loga requisições lentas com o contexto necessário para reproduzir: quem
 * chamou, qual rota e quanto demorou. O log de sucesso normal é do pino-http;
 * aqui só entra o que merece atenção.
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
	constructor(private readonly logger: PinoLogger) {
		this.logger.setContext(LoggingInterceptor.name);
	}

	intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
		const request = context.switchToHttp().getRequest<RequestWithId>();
		const startedAt = Date.now();

		return next.handle().pipe(
			tap(() => {
				const durationMs = Date.now() - startedAt;
				if (durationMs <= SLOW_REQUEST_MS) {
					return;
				}

				const payload = {
					requestId: request.id,
					userId: request.user?.id,
					method: request.method,
					url: request.url,
					durationMs,
				};

				if (durationMs > CRITICAL_REQUEST_MS) {
					this.logger.error(payload, 'requisição crítica');
				} else {
					this.logger.warn(payload, 'requisição lenta');
				}
			}),
		);
	}
}
