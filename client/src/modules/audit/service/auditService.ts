import { api } from '@/api/axios';
import type { AuditFilters, PaginatedAuditLog } from '@/modules/audit/types/audit';

export async function listAuditLogService(
	params: { limit: number; offset: number } & AuditFilters
): Promise<PaginatedAuditLog> {
	const { data } = await api.get<PaginatedAuditLog>('/audit', { params });
	return data;
}
