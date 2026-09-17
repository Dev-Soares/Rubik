import { api } from '@/api/axios';
import type {
	NotificationEntry,
	NotificationFilters,
	PaginatedNotifications,
	UnreadCount,
} from '@/modules/notifications/types/notification';

export async function listNotificationsService(
	params: { limit: number; offset: number } & NotificationFilters,
): Promise<PaginatedNotifications> {
	const { data } = await api.get<PaginatedNotifications>('/notifications', { params });
	return data;
}

export async function getUnreadCountService(): Promise<UnreadCount> {
	const { data } = await api.get<UnreadCount>('/notifications/unread-count');
	return data;
}

export async function markNotificationReadService(id: string): Promise<NotificationEntry> {
	const { data } = await api.patch<NotificationEntry>(`/notifications/${id}/read`);
	return data;
}

export async function markAllNotificationsReadService(): Promise<{ marked: number }> {
	const { data } = await api.patch<{ marked: number }>('/notifications/read-all');
	return data;
}
