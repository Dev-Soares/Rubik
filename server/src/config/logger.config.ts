import type { Params } from 'nestjs-pino';
import { env, isProduction } from 'src/config/env';

export const loggerConfig: Params = {
	pinoHttp: {
		level: env.LOG_LEVEL,
		autoLogging: true,
		redact: ['req.headers.cookie', 'req.headers.authorization'],
		serializers: {
			req: (req: { method: string; url: string }) => ({
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
						ignore: 'pid,hostname',
						singleLine: true,
					},
				},
	},
};
