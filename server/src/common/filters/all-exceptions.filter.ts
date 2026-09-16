import {
	type ArgumentsHost,
	Catch,
	type ExceptionFilter,
	HttpException,
	HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { PinoLogger } from 'nestjs-pino';
import { isProduction } from 'src/config/env';

const SERVER_ERROR_THRESHOLD = 500;

type ErrorBody = {
	statusCode: number;
	message: string | string[];
	error: string;
	path: string;
	timestamp: string;
};

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
	constructor(private readonly logger: PinoLogger) {
		this.logger.setContext(AllExceptionsFilter.name);
	}

	catch(exception: unknown, host: ArgumentsHost): void {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		const request = ctx.getRequest<Request>();

		const status: number =
			exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

		const body: ErrorBody = {
			statusCode: status,
			message: this.extractMessage(exception, status),
			error: HttpStatus[status] ?? 'ERROR',
			path: request.url,
			timestamp: new Date().toISOString(),
		};

		if (status >= SERVER_ERROR_THRESHOLD) {
			this.logger.error({ err: exception, path: request.url }, 'erro não tratado');
		} else {
			this.logger.warn({ status, path: request.url, message: body.message }, 'requisição falhou');
		}

		response.status(status).json(body);
	}

	private extractMessage(exception: unknown, status: number): string | string[] {
		if (exception instanceof HttpException) {
			const payload = exception.getResponse();
			if (typeof payload === 'string') {
				return payload;
			}
			const message = (payload as { message?: string | string[] }).message;
			return message ?? exception.message;
		}

		if (!isProduction && exception instanceof Error) {
			return exception.message;
		}

		return status >= SERVER_ERROR_THRESHOLD ? 'Erro interno no servidor.' : 'Requisição inválida.';
	}
}
