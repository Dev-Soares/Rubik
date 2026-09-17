import { Suspense, useState } from 'react';
import { AuditFiltersBar } from '@/modules/audit/components/AuditFiltersBar';
import { AuditList } from '@/modules/audit/components/AuditList';
import { AuditTimelineSkeleton } from '@/modules/audit/skeletons/AuditTimelineSkeleton';
import type { AuditFilters } from '@/modules/audit/types/audit';
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue';

const SEARCH_DEBOUNCE_MS = 400;

/**
 * Os filtros ficam fora do Suspense de propósito: trocar um filtro não deve
 * fazer a barra sumir junto com a lista — nem o campo de busca perder o foco
 * no meio da digitação.
 */
export function AuditPanel() {
	const [filters, setFilters] = useState<AuditFilters>({});

	// Só a busca é adiada; os demais filtros valem no clique.
	const debouncedSearch = useDebouncedValue(filters.search, SEARCH_DEBOUNCE_MS);
	const appliedFilters: AuditFilters = { ...filters, search: debouncedSearch };

	return (
		<div className="flex flex-col gap-6">
			<AuditFiltersBar filters={filters} onChange={setFilters} />

			<Suspense fallback={<AuditTimelineSkeleton />}>
				<AuditList filters={appliedFilters} />
			</Suspense>
		</div>
	);
}
