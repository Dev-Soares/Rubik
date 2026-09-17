import { Global, Module } from '@nestjs/common';
import { NotificationsController } from 'src/modules/notifications/notifications.controller';
import { NotificationsService } from 'src/modules/notifications/notifications.service';

/**
 * Global: qualquer módulo pode precisar notificar alguém, e exigir o import
 * em cada um deles só adicionaria ruído — mesma razão do `AuditModule`.
 */
@Global()
@Module({
	controllers: [NotificationsController],
	providers: [NotificationsService],
	exports: [NotificationsService],
})
export class NotificationsModule {}
