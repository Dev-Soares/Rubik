import { Global, Module } from '@nestjs/common';
import { AuditController } from 'src/modules/audit/audit.controller';
import { AuditService } from 'src/modules/audit/audit.service';
import { RolesModule } from 'src/modules/roles/roles.module';

/** Global: o `AuditInterceptor` é registrado em `APP_INTERCEPTOR` e precisa do service. */
@Global()
@Module({
	// O `ScreensGuard` da rota resolve as permissões pelo `RolesService`.
	imports: [RolesModule],
	controllers: [AuditController],
	providers: [AuditService],
	exports: [AuditService],
})
export class AuditModule {}
