import { cn } from 'cn';
import {
	ACTION_ACCESS,
	ACTION_ACCESS_LABELS,
	ACTION_LABELS,
	type AccessByPermission,
	type ActionAccess,
	type Permission,
} from '@/modules/roles/types/role';
import {
	hasAction,
	STANDARD_ACTIONS,
	type CatalogModule,
	type StandardAction,
} from '@/modules/roles/types/catalog';
import { toPermission } from '@/modules/roles/utils';
import { ToggleGroup, ToggleGroupItem } from '@/shared/components/ui/toggle-group';

/**
 * `herda` fica neutro: é o padrão, e o que precisa saltar à vista é a exceção
 * que alguém criou. Bloquear usa `destructive` — tira acesso que o cargo dá.
 */
const ACCESS_CLASS: Record<ActionAccess, string> = {
	herda: '',
	libera: 'data-[state=on]:bg-primary/20 data-[state=on]:text-primary',
	bloqueia: 'data-[state=on]:bg-destructive/15 data-[state=on]:text-destructive',
};

type UserPermissionRowProps = {
	item: CatalogModule;
	access: AccessByPermission;
	/** O que o cargo do usuário dá, para a escolha não ser às cegas. */
	inherited: readonly Permission[];
	onChange: (permission: Permission, value: ActionAccess) => void;
	disabled?: boolean;
};

/** Uma linha da tabela: o módulo e, por ação, herda / libera / bloqueia. */
export function UserPermissionRow({
	item,
	access,
	inherited,
	onChange,
	disabled,
}: UserPermissionRowProps) {
	const temExcecao = STANDARD_ACTIONS.some((action) => {
		if (!hasAction(item.module, action)) {
			return false;
		}
		return access[toPermission(item.module, action)] !== 'herda';
	});

	return (
		<div
			className={cn(
				'flex flex-col gap-2 border-b px-3 py-3 last:border-b-0',
				temExcecao && 'bg-primary/5',
			)}
		>
			<div className="flex min-w-0 flex-col gap-0.5">
				<span className="text-sm font-medium">{item.title}</span>
				<span className="text-muted-foreground text-xs leading-snug">{item.description}</span>
			</div>

			<div className="flex flex-col gap-1.5">
				{STANDARD_ACTIONS.filter((action) => hasAction(item.module, action)).map((action) => {
					const permission = toPermission(item.module, action);
					const doCargo = inherited.includes(permission);

					return (
						<div key={action} className="flex items-center justify-between gap-2">
							<span className="text-muted-foreground shrink-0 text-xs">
								{ACTION_LABELS[action as StandardAction]}
							</span>

							<ToggleGroup
								type="single"
								value={access[permission]}
								onValueChange={(next) => next && onChange(permission, next as ActionAccess)}
								disabled={disabled}
								aria-label={`${item.title}: ${ACTION_LABELS[action as StandardAction]}`}
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
