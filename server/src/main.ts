import 'reflect-metadata';

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { Logger as PinoAppLogger } from 'nestjs-pino';
import { auth } from 'src/modules/auth/auth';
import { toNodeHandler } from 'better-auth/node';
import { AppModule } from 'src/app.module';
import { corsOrigins, env, isStorageEnabled } from 'src/config/env';

async function bootstrap(): Promise<void> {
	const app = await NestFactory.create(AppModule, { bufferLogs: true });

	// Sem isto, todo log do próprio Nest (boot, rotas, shutdown) sai pelo logger
	// padrão em texto solto, fora do JSON que a produção coleta.
	const logger = app.get(PinoAppLogger);
	app.useLogger(logger);

	app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
	app.use(cookieParser());

	app.enableCors({
		origin: corsOrigins,
		methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
		// X-Request-Id é posto pelo interceptor do axios em toda requisição; sem
		// ele no allowedHeaders o preflight falha e nenhuma chamada sai do client.
		allowedHeaders: 'Content-Type,Accept,Authorization,X-Request-Id',
		// E sem expor o header na resposta o browser esconde ele do JS, quebrando
		// a correlação de erro de `getRequestId` (client/src/api/axios.ts).
		exposedHeaders: 'X-Request-Id',
		credentials: true,
	});

	app.use('/auth/{*splat}', toNodeHandler(auth));

	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			forbidNonWhitelisted: true,
			transform: true,
			transformOptions: { enableImplicitConversion: false },
		}),
	);

	app.enableShutdownHooks();

	await app.listen(env.PORT);

	// Estado das integrações opcionais no boot: descobrir que o storage estava
	// desligado só quando o upload falha custa uma investigação inteira.
	logger.log(
		{
			port: env.PORT,
			env: env.NODE_ENV,
			logLevel: env.LOG_LEVEL,
			storage: isStorageEnabled ? 'on' : 'off',
			ticketWebhook: env.TICKET_WEBHOOK_URL === '' ? 'off' : 'on',
			corsOrigins,
		},
		'API no ar',
	);
}

void bootstrap();
