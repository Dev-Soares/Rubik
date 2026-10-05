import { Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import type { Paginated } from 'src/common/types/pagination.types';
import { QueryNotificationsDto } from 'src/modules/notifications/dto/query-notifications.dto';
import { NotificationsService } from 'src/modules/notifications/notifications.service';
import type {
	NotificationEntry,
	UnreadCount,
} from 'src/modules/notifications/types/notification.types';

/**
 * Todas as rotas operam sobre as notificações do usuário da sessão — o id vem
 * do `@CurrentUser`, nunca da requisição. Por isso não há `ScreensGuard` aqui:
 * não existe caso em que um usuário leia a caixa de outro, nem mesmo admin.
 *
 * Não há rota de criação: quem notifica é a aplicação, via
 * `NotificationsService`, não o usuário.
 */
@Controller('notifications')
export class NotificationsController {
	constructor(private readonly notificationsService: NotificationsService) {}

	/** Lista as notificações do usuário, da mais recente para a mais antiga. */
	@Get()
	findAll(
		@CurrentUser('id') userId: string,
		@Query() query: QueryNotificationsDto,
	): Promise<Paginated<NotificationEntry>> {
		return this.notificationsService.findAllForUser(userId, query);
	}

	/**
	 * Contagem de não lidas. Rota própria porque o sino a consulta em intervalo
	 * curto e não precisa do corpo das notificações.
	 */
	@Get('unread-count')
	async countUnread(@CurrentUser('id') userId: string): Promise<UnreadCount> {
		return { count: await this.notificationsService.countUnreadForUser(userId) };
	}

	/** Marca todas as não lidas como lidas. */
	@Patch('read-all')
	async markAllRead(@CurrentUser('id') userId: string): Promise<{ marked: number }> {
		return { marked: await this.notificationsService.markAllRead(userId) };
	}

	/** Marca uma notificação como lida. */
	@Patch(':id/read')
	markRead(@Param('id') id: string, @CurrentUser('id') userId: string): Promise<NotificationEntry> {
		return this.notificationsService.markRead(id, userId);
	}
}
