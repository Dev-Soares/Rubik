import 'reflect-metadata';

import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import basicAuth from 'express-basic-auth';
import helmet from 'helmet';
import { auth } from 'src/modules/auth/auth';
import { toNodeHandler } from 'better-auth/node';
import { AppModule } from 'src/app.module';
import { corsOrigins, env, isProduction } from 'src/config/env';

async function bootstrap(): Promise<void> {
	const app = await NestFactory.create(AppModule, { bufferLogs: true });

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

	Logger.log(`API em http://localhost:${env.PORT}`, 'Bootstrap');
}

void bootstrap();
