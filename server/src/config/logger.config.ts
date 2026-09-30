import { randomUUID } from 'node:crypto';

import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Params } from 'nestjs-pino';
import { env, isProduction } from 'src/config/env';

/**
 * Header de correlação. O client manda o seu em cada request; quando não vem,
 * geramos aqui. O mesmo id volta na resposta, então um erro reportado pelo
 * usuário tem como ser achado no log sem depender de horário aproximado.
 */
export const REQUEST_ID_HEADER = 'x-request-id';

const SERVER_ERROR_THRESHOLD = 500;
const CLIENT_ERROR_THRESHOLD = 400;

/**
 * Campos que nunca podem aparecer no log, em qualquer profundidade do objeto.
 * Cookie e authorization carregam a sessão inteira; os de corpo carregam
 * credencial em texto puro quando alguém loga um DTO de login por engano.
 */
const REDACTED_PATHS = [
	'req.headers.cookie',
	'req.headers.authorization',
	'req.headers["x-api-key"]',
	'req.headers["set-cookie"]',
	'res.headers["set-cookie"]',
	'*.password',
	'*.currentPassword',
	'*.newPassword',
	'*.token',
	'*.secret',
	'*.apiKey',
	'*.accessKeyId',
	'*.secretAccessKey',
];

type RequestWithUser = IncomingMessage & {
	id?: string;
	user?: { id?: string; role?: string };
};

export const loggerConfig: Params = {
	pinoHttp: {
		level: env.LOG_LEVEL,
		autoLogging: true,
		redact: { paths: REDACTED_PATHS, censor: '[redacted]' },

		// Um id por request, reaproveitado se o client já mandou o dele.
		genReqId: (req: IncomingMessage, res: ServerResponse) => {
			const fromClient = req.headers[REQUEST_ID_HEADER];
			const id = typeof fromClient === 'string' && fromClient !== '' ? fromClient : randomUUID();
			res.setHeader(REQUEST_ID_HEADER, id);
			return id;
		},

		/**
		 * `AuthGuard` põe `user` no request antes do handler; como o pino-http
		 * serializa a requisição no fim do ciclo, o id do usuário já está lá.
		 * Sem isto, todo log de erro é anônimo e a investigação começa por
		 * cruzar horário com tabela de sessão.
		 */
		customProps: (req) => {
			const user = (req as RequestWithUser).user;
			return user?.id ? { userId: user.id, userRole: user.role } : {};
		},

		// 4xx é erro do chamador, não incidente: fica em warn para não poluir o
		// alerta de produção, que deve disparar só em 5xx.
		customLogLevel: (_req, res, err) => {
			if (err || res.statusCode >= SERVER_ERROR_THRESHOLD) {
				return 'error';
			}
			if (res.statusCode >= CLIENT_ERROR_THRESHOLD) {
				return 'warn';
			}
			return 'info';
		},

		serializers: {
			req: (req: RequestWithUser & { method: string; url: string }) => ({
				id: req.id,
				method: req.method,
				url: req.url,
			}),
			res: (res: { statusCode: number }) => ({
				statusCode: res.statusCode,
			}),
		},

		transport: isProduction
			? undefined
			: {
					target: 'pino-pretty',
					options: {
						colorize: true,
						translateTime: 'HH:MM:ss',
						ignore: 'pid,hostname,req.id',
						singleLine: true,
					},
				},
	},
};
