import { infiniteQueryOptions, useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { listAuditLogService } from '@/modules/audit/service/auditService';
import type { AuditFilters } from '@/modules/audit/types/audit';
import { nextOffset } from '@/modules/audit/utils';

const PAGE_SIZE = 20;

export function auditLogQueryOptions(filters: AuditFilters = {}, limit = PAGE_SIZE) {
	return infiniteQueryOptions({
		queryKey: ['audit', { limit, ...filters }],
		queryFn: ({ pageParam }) => listAuditLogService({ limit, offset: pageParam, ...filters }),
		initialPageParam: 0,
		getNextPageParam: nextOffset,
	});
}

export function useAuditLog(filters: AuditFilters = {}, limit = PAGE_SIZE) {
	return useSuspenseInfiniteQuery(auditLogQueryOptions(filters, limit));
}
