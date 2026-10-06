import { cn } from 'cn';
import { EyeIcon, PencilIcon, PlusIcon, Trash2Icon, type LucideIcon } from 'lucide-react';
import {
	ACTION_HINTS,
	ACTION_LABELS,
	MODULE_LABELS,
	type Action,
	type Module,
	type Permission,
} from '@/modules/roles/types/role';
import { actionsOf, toPermission } from '@/modules/roles/utils';

/** O ícone de cada ação, para a linha ser lida de relance. */
const ACTION_ICONS: Record<Action, LucideIcon> = {
	ver: EyeIcon,
	criar: PlusIcon,
	editar: PencilIcon,
	apagar: Trash2Icon,
};

type ModulePermissionCardProps = {
	module: Module;
	permissions: readonly Permission[];
	onToggleAction: (action: Action) => void;
	onToggleModule: () => void;
	disabled?: boolean;
};

/**
 * Card de um módulo com as ações como botões independentes. Um botão por ação
 * (e não um controle que cicla) deixa à mostra o que está ligado: é a tabela
 * que o administrador lê de relance antes de salvar.
 */
export function ModulePermissionCard({
	module,
	permissions,
	onToggleAction,
	onToggleModule,
	disabled,
}: ModulePermissionCardProps) {
	const actions = actionsOf(module);
	const granted = actions.filter((action) => permissions.includes(toPermission(module, action)));
	const todas = granted.length === actions.length;

	return (
		<div
			className={cn(
				'flex flex-col gap-3 rounded-md border p-3 transition-colors',
				granted.length > 0 ? 'border-primary/30 bg-primary/5' : 'border-border',
			)}
		>
			<div className="flex items-center justify-between gap-2">
				<span className="truncate text-sm font-medium">{MODULE_LABELS[module]}</span>

				<button
					type="button"
					onClick={onToggleModule}
					disabled={disabled}
					className="text-muted-foreground hover:text-foreground shrink-0 text-xs font-medium transition-colors disabled:opacity-50"
				>
					{todas ? 'Limpar' : 'Tudo'}
				</button>
			</div>

			<div className="flex flex-wrap gap-1.5">
				{actions.map((action) => {
					const Icon = ACTION_ICONS[action];
					const active = permissions.includes(toPermission(module, action));

					return (
						<button
							key={action}
							type="button"
							onClick={() => onToggleAction(action)}
							disabled={disabled}
							aria-pressed={active}
							title={ACTION_HINTS[action]}
							className={cn(
								'inline-flex h-8 min-w-16 flex-1 items-center justify-center gap-1.5 rounded-sm border px-2 text-xs font-medium transition-colors disabled:opacity-50',
								active
									? 'border-primary/40 bg-primary/15 text-primary font-semibold'
									: 'border-transparent bg-muted/50 text-muted-foreground hover:text-foreground',
							)}
						>
							<Icon className="size-3.5 shrink-0" />
							{ACTION_LABELS[action]}
						</button>
					);
				})}
			</div>
		</div>
	);
}
