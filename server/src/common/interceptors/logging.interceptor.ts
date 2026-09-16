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

const SLOW_REQUEST_MS = 1000;

/** Loga em `warn` requisições acima do limite de latência. */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
	constructor(private readonly logger: PinoLogger) {
		this.logger.setContext(LoggingInterceptor.name);
	}

	intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
		const request = context.switchToHttp().getRequest<Request>();
		const startedAt = Date.now();

		return next.handle().pipe(
			tap(() => {
				const durationMs = Date.now() - startedAt;
				if (durationMs > SLOW_REQUEST_MS) {
					this.logger.warn(
						{ method: request.method, url: request.url, durationMs },
						'requisição lenta',
					);
				}
			}),
		);
	}
}
