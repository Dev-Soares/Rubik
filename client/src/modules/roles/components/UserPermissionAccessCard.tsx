import { cn } from 'cn';
import {
	ACTION_ACCESS,
	ACTION_ACCESS_LABELS,
	ACTION_LABELS,
	MODULE_LABELS,
	type AccessByPermission,
	type ActionAccess,
	type Module,
	type Permission,
} from '@/modules/roles/types/role';
import { actionsOf, toPermission } from '@/modules/roles/utils';
import { ToggleGroup, ToggleGroupItem } from '@/shared/components/ui/toggle-group';

/**
 * `herda` fica neutro: é o estado padrão, e o que precisa saltar à vista é a
 * exceção que alguém criou. Bloquear usa `destructive` — tira acesso do cargo.
 */
const ACCESS_CLASS: Record<ActionAccess, string> = {
	herda: '',
	libera: 'data-[state=on]:bg-primary/20 data-[state=on]:text-primary',
	bloqueia: 'data-[state=on]:bg-destructive/15 data-[state=on]:text-destructive',
};

type UserPermissionAccessCardProps = {
	module: Module;
	access: AccessByPermission;
	/** O que o cargo do usuário dá, para a escolha não ser às cegas. */
	inherited: readonly Permission[];
	onChange: (permission: Permission, value: ActionAccess) => void;
	disabled?: boolean;
};

/** Um módulo com uma linha por ação: herda do cargo, libera ou bloqueia. */
export function UserPermissionAccessCard({
	module,
	access,
	inherited,
	onChange,
	disabled,
}: UserPermissionAccessCardProps) {
	const temExcecao = actionsOf(module).some(
		(action) => access[toPermission(module, action)] !== 'herda',
	);

	return (
		<div
			className={cn(
				'flex flex-col gap-2 rounded-md border p-3 transition-colors',
				temExcecao ? 'border-primary/30 bg-primary/5' : 'border-border',
			)}
		>
			<span className="truncate text-sm font-medium">{MODULE_LABELS[module]}</span>

			<div className="flex flex-col gap-1.5">
				{actionsOf(module).map((action) => {
					const permission = toPermission(module, action);
					const doCargo = inherited.includes(permission);

					return (
						<div key={action} className="flex items-center justify-between gap-2">
							<span className="text-muted-foreground shrink-0 text-xs">
								{ACTION_LABELS[action]}
							</span>

							<ToggleGroup
								type="single"
								value={access[permission]}
								onValueChange={(next) => next && onChange(permission, next as ActionAccess)}
								disabled={disabled}
								aria-label={`${MODULE_LABELS[module]}: ${ACTION_LABELS[action]}`}
								className="bg-muted/40 gap-0 rounded-sm p-0.5"
							>
								{ACTION_ACCESS.map((option) => (
									<ToggleGroupItem
										key={option}
										value={option}
										title={
											option === 'herda'
												? `${ACTION_ACCESS_LABELS.herda} (${doCargo ? 'liberado' : 'bloqueado'})`
												: ACTION_ACCESS_LABELS[option]
										}
										aria-label={ACTION_ACCESS_LABELS[option]}
										className={cn(
											'h-6 rounded-sm border-0 px-2 text-xs font-medium transition-colors data-[state=on]:font-semibold',
											ACCESS_CLASS[option],
										)}
									>
										{ACTION_ACCESS_LABELS[option]}
									</ToggleGroupItem>
								))}
							</ToggleGroup>
						</div>
					);
				})}
			</div>
		</div>
	);
}
