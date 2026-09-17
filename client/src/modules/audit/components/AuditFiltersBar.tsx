import { SearchIcon } from 'lucide-react';
import {
	AUDIT_ACTION_LABELS,
	AUDIT_ACTIONS,
	AUDIT_ENTITY_LABELS,
	type AuditAction,
	type AuditFilters,
} from '@/modules/audit/types/audit';
import { SelectField, type SelectOption } from '@/shared/components/SelectField';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';

type AuditFiltersBarProps = {
	filters: AuditFilters;
	onChange: (filters: AuditFilters) => void;
};

/** `all` é o valor de "sem filtro": o Select do shadcn não aceita item vazio. */
const ALL = 'all';

const ACTION_OPTIONS: SelectOption[] = [
	{ value: ALL, label: 'Todas' },
	...AUDIT_ACTIONS.map((action) => ({ value: action, label: AUDIT_ACTION_LABELS[action] })),
];

const ENTITY_OPTIONS: SelectOption[] = [
	{ value: ALL, label: 'Todos' },
	...Object.entries(AUDIT_ENTITY_LABELS).map(([value, label]) => ({ value, label })),
];

export function AuditFiltersBar({ filters, onChange }: AuditFiltersBarProps) {
	const hasFilters = Object.values(filters).some(Boolean);

	return (
		<div className="flex flex-col gap-4">
			<div className="relative">
				<SearchIcon
					aria-hidden
					className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
				/>
				<Input
					type="search"
					aria-label="Buscar por nome ou e-mail"
					placeholder="Buscar por nome ou e-mail..."
					className="h-11 pl-9"
					value={filters.search ?? ''}
					onChange={(event) => onChange({ ...filters, search: event.target.value || undefined })}
				/>
			</div>

			<div className="flex flex-wrap items-end gap-4">
				<div className="min-w-36 flex-1">
					<SelectField
						label="Ação"
						name="action"
						options={ACTION_OPTIONS}
						value={filters.action ?? ALL}
						onChange={(value) =>
							onChange({ ...filters, action: value === ALL ? undefined : (value as AuditAction) })
						}
					/>
				</div>

				<div className="min-w-36 flex-1">
					<SelectField
						label="Recurso"
						name="entity"
						options={ENTITY_OPTIONS}
						value={filters.entity ?? ALL}
						onChange={(value) => onChange({ ...filters, entity: value === ALL ? undefined : value })}
					/>
				</div>

				<div className="flex min-w-36 flex-1 flex-col gap-2">
					<Label
						htmlFor="from"
						className="text-muted-foreground text-xs font-semibold tracking-wider uppercase"
					>
						De
					</Label>
					<Input
						id="from"
						type="date"
						className="h-11"
						value={filters.from ?? ''}
						onChange={(event) => onChange({ ...filters, from: event.target.value || undefined })}
					/>
				</div>

				<div className="flex min-w-36 flex-1 flex-col gap-2">
					<Label
						htmlFor="to"
						className="text-muted-foreground text-xs font-semibold tracking-wider uppercase"
					>
						Até
					</Label>
					<Input
						id="to"
						type="date"
						className="h-11"
						value={filters.to ?? ''}
						onChange={(event) => onChange({ ...filters, to: event.target.value || undefined })}
					/>
				</div>

				{hasFilters ? (
					<Button variant="ghost" className="h-11" onClick={() => onChange({})}>
						Limpar
					</Button>
				) : null}
			</div>
		</div>
	);
}
