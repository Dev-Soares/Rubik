import { cn } from 'cn';
import { ACTION_HINTS, ACTION_LABELS, type Permission } from '@/modules/roles/types/role';
import {
	hasAction,
	STANDARD_ACTIONS,
	type CatalogModule,
	type StandardAction,
} from '@/modules/roles/types/catalog';
import { toPermission } from '@/modules/roles/utils';
import { Checkbox } from '@/shared/components/ui/checkbox';

type PermissionRowProps = {
	item: CatalogModule;
	permissions: readonly Permission[];
	onToggle: (action: StandardAction) => void;
	disabled?: boolean;
};

/**
 * Uma linha da tabela: o módulo à esquerda e uma caixa por ação. Módulo que
 * não declara a ação mostra um traço, para a coluna vazia ser uma informação
 * ("não existe") e não um estado ("está desmarcada").
 */
export function PermissionRow({ item, permissions, onToggle, disabled }: PermissionRowProps) {
	const ativo = permissions.some((permission) => permission.startsWith(`${item.module}:`));

	return (
		<div
			className={cn(
				'grid grid-cols-1 gap-x-2 gap-y-3 border-b px-3 py-3 last:border-b-0 sm:grid-cols-[minmax(0,1fr)_repeat(4,3.5rem)]',
				ativo && 'bg-primary/5',
			)}
		>
			<div className="flex min-w-0 flex-col gap-0.5">
				<span className="text-sm font-medium">{item.title}</span>
				<span className="text-muted-foreground text-xs leading-snug">{item.description}</span>
			</div>

			{STANDARD_ACTIONS.map((action) => {
				const existe = hasAction(item.module, action);
				const permission = existe ? toPermission(item.module, action) : null;
				const marcado = permission !== null && permissions.includes(permission);

				return (
					<div key={action} className="flex items-center gap-2 sm:justify-center">
						{existe ? (
							<>
								<Checkbox
									id={`${item.module}-${action}`}
									checked={marcado}
									disabled={disabled}
									onCheckedChange={() => onToggle(action)}
									title={ACTION_HINTS[action]}
									aria-label={`${item.title}: ${ACTION_LABELS[action]}`}
								/>
								{/* No celular não há cabeçalho de coluna: o rótulo vem junto. */}
								<label
									htmlFor={`${item.module}-${action}`}
									className="text-muted-foreground cursor-pointer text-xs sm:hidden"
								>
									{ACTION_LABELS[action]}
								</label>
							</>
						) : (
							<span
								className="text-muted-foreground/40 hidden text-xs select-none sm:block"
								aria-hidden
							>
								—
							</span>
						)}
					</div>
				);
			})}
		</div>
	);
}
