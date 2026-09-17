import { Global, Module } from '@nestjs/common';
import { AuditController } from 'src/modules/audit/audit.controller';
import { AuditService } from 'src/modules/audit/audit.service';

/** Global: o `AuditInterceptor` é registrado em `APP_INTERCEPTOR` e precisa do service. */
@Global()
@Module({
	controllers: [AuditController],
	providers: [AuditService],
	exports: [AuditService],
})
export class AuditModule {}
