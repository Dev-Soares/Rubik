import { USER_STATUS_FILTERS, type UserStatusFilter } from '@/modules/users/types/user';
import { cn } from '@/shared/lib/utils';

const TAB_LABELS: Record<UserStatusFilter, string> = {
	todos: 'Todos',
	ativo: 'Ativos',
	inativo: 'Inativos',
};

type UserStatusTabsProps = {
	value: UserStatusFilter;
	onChange: (status: UserStatusFilter) => void;
};

export function UserStatusTabs({ value, onChange }: UserStatusTabsProps) {
	return (
		/* `tablist` em vez de um grupo de botões: são visões alternativas da
		 * mesma lista, e é assim que o leitor de tela as anuncia. */
		<div role="tablist" aria-label="Filtrar usuários por situação" className="flex border-b">
			{USER_STATUS_FILTERS.map((status) => {
				const selected = status === value;

				return (
					<button
						key={status}
						id={`user-tab-${status}`}
						type="button"
						role="tab"
						aria-selected={selected}
						onClick={() => onChange(status)}
						className={cn(
							// `-mb-px` sobrepõe a borda inferior do contêiner, senão a
							// linha da aba ativa fica flutuando acima dela.
							'-mb-px flex flex-1 items-center justify-center border-b-2 px-4 py-3 text-sm font-semibold transition-colors sm:flex-none sm:px-8',
							selected
								? 'border-primary text-primary'
								: 'text-muted-foreground hover:text-foreground border-transparent',
						)}
					>
						{TAB_LABELS[status]}
					</button>
				);
			})}
		</div>
	);
}
