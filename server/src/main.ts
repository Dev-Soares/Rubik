import 'reflect-metadata';

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import basicAuth from 'express-basic-auth';
import helmet from 'helmet';
import { Logger as PinoAppLogger } from 'nestjs-pino';
import { auth } from 'src/modules/auth/auth';
import { toNodeHandler } from 'better-auth/node';
import { AppModule } from 'src/app.module';
import { corsOrigins, env, isProduction, isStorageEnabled } from 'src/config/env';

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
		allowedHeaders: 'Content-Type,Accept,Authorization',
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

	if (!isProduction) {
		const swaggerConfig = new DocumentBuilder()
			.setTitle('App API')
			.setDescription('Documentação da API')
			.setVersion('0.1')
			.addCookieAuth('app.session_token')
			.build();

		app.use(
			'/api-docs',
			basicAuth({
				users: { [env.SWAGGER_USER]: env.SWAGGER_PASSWORD },
				challenge: true,
			}),
		);

		SwaggerModule.setup('api-docs', app, SwaggerModule.createDocument(app, swaggerConfig));
	}

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
