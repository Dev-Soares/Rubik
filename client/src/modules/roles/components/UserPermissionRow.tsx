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
 * A opção ativa sempre ganha fundo sólido — num grupo de três, fundo tênue não
 * dizia qual estava escolhida. `herda` usa a cor neutra por ser o padrão;
 * bloquear usa `destructive`, porque tira acesso que o cargo dá.
 */
const ACCESS_CLASS: Record<ActionAccess, string> = {
	herda: 'data-[state=on]:bg-background data-[state=on]:text-foreground',
	libera: 'data-[state=on]:bg-primary data-[state=on]:text-primary-foreground',
	bloqueia: 'data-[state=on]:bg-destructive data-[state=on]:text-white',
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
		<div className="flex flex-col gap-2.5 border-b px-4 py-3.5 last:border-b-0">
			<div className="flex min-w-0 items-start gap-2">
				<div className="flex min-w-0 flex-1 flex-col gap-0.5">
					<span className="text-sm leading-snug font-semibold">{item.title}</span>
					<span className="text-muted-foreground text-xs leading-snug">{item.description}</span>
				</div>

				{/* Marca a linha que tem exceção sem tingir o fundo, que competia
				    com a cor do próprio chip de bloqueio. */}
				{temExcecao ? (
					<span className="bg-primary/10 text-primary shrink-0 rounded-full px-2 py-0.5 text-[0.6875rem] font-semibold">
						Personalizado
					</span>
				) : null}
			</div>

			<div className="flex flex-col gap-1">
				{STANDARD_ACTIONS.filter((action) => hasAction(item.module, action)).map((action) => {
					const permission = toPermission(item.module, action);
					const doCargo = inherited.includes(permission);

					return (
						<div key={action} className="flex items-center gap-3">
							<span className="text-muted-foreground w-12 shrink-0 text-xs">
								{ACTION_LABELS[action as StandardAction]}
							</span>

							<ToggleGroup
								type="single"
								value={access[permission]}
								onValueChange={(next) => next && onChange(permission, next as ActionAccess)}
								disabled={disabled}
								aria-label={`${item.title}: ${ACTION_LABELS[action as StandardAction]}`}
								// `grid-cols-3` com colunas iguais: as três opções têm
								// larguras de texto diferentes, e sem isso cada linha do
								// catálogo alinhava os chips num lugar diferente.
								className="bg-muted/50 grid flex-1 grid-cols-3 gap-0.5 rounded-md p-0.5"
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
											'h-7 min-w-0 rounded-sm border-0 px-1 text-xs font-medium transition-colors data-[state=on]:shadow-sm',
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
