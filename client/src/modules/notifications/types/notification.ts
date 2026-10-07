import type { Paginated } from '@/shared/types/pagination';

/**
 * Espelha `NotificationEntry` do backend
 * (`server/src/modules/notifications/types/notification.types.ts`).
 * As datas chegam como string ISO no JSON.
 */
export type NotificationEntry = {
	id: string;
	kind: string;
	title: string;
	body: string | null;
	/**
	 * Destino do item. Vem do backend como texto livre, sem validação de tipo:
	 * `resolveNotificationLink` confere se a rota existe antes de virar `<Link>`,
	 * porque destino inválido faz o router lançar.
	 */
	link: string | null;
	readAt: string | null;
	createdAt: string;
};

export type NotificationFilters = {
	/** Restringe às não lidas. */
	unreadOnly?: boolean;
	kind?: string;
};

export type PaginatedNotifications = Paginated<NotificationEntry>;

export type UnreadCount = {
	count: number;
};

/**
 * Destaque visual de um tipo de aviso. `kind` é texto livre no backend, então
 * o mapa abaixo é o ponto em que cada projeto derivado registra os seus —
 * tipo não mapeado cai no estilo neutro de `DEFAULT_NOTIFICATION_TONE`.
 */
export type NotificationTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

export const DEFAULT_NOTIFICATION_TONE: NotificationTone = 'neutral';

/**
 * Sem isto toda a lista fica cinza uniforme e o item que exige ação do usuário
 * passa despercebido no meio dos avisos informativos.
 */
export const NOTIFICATION_TONES: Record<string, NotificationTone> = {};
