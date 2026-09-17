import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';
import { AllExceptionsFilter } from 'src/common/filters/all-exceptions.filter';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { AuditInterceptor } from 'src/common/interceptors/audit.interceptor';
import { LoggingInterceptor } from 'src/common/interceptors/logging.interceptor';
import { loggerConfig } from 'src/config/logger.config';
import { DbModule } from 'src/db/db.module';
import { AuditModule } from 'src/modules/audit/audit.module';
import { AuthModule } from 'src/modules/auth/auth.module';
import { HealthModule } from 'src/modules/health/health.module';
import { NotificationsModule } from 'src/modules/notifications/notifications.module';
import { RolesModule } from 'src/modules/roles/roles.module';
import { UsersModule } from 'src/modules/users/users.module';

const THROTTLE_TTL_MS = 60_000;
const THROTTLE_LIMIT = 100;

@Module({
	imports: [
		LoggerModule.forRoot(loggerConfig),
		ThrottlerModule.forRoot([{ ttl: THROTTLE_TTL_MS, limit: THROTTLE_LIMIT }]),
		DbModule,
		AuditModule,
		AuthModule,
		UsersModule,
		RolesModule,
		NotificationsModule,
		HealthModule,
	],
	providers: [
		{ provide: APP_GUARD, useClass: ThrottlerGuard },
		{ provide: APP_GUARD, useClass: AuthGuard },
		{ provide: APP_FILTER, useClass: AllExceptionsFilter },
		{ provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
		{ provide: APP_INTERCEPTOR, useClass: AuditInterceptor },
	],
})
export class AppModule {}
