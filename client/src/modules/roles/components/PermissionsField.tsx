import { PermissionRow } from '@/modules/roles/components/PermissionRow';
import {
	PERMISSION_CATALOG,
	SECTORS,
	STANDARD_ACTIONS,
	type StandardAction,
} from '@/modules/roles/types/catalog';
import { ACTION_LABELS, MODULES, type Module, type Permission } from '@/modules/roles/types/role';
import { countGranted, togglePermission } from '@/modules/roles/utils';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';

type PermissionsFieldProps = {
	value: Permission[];
	onChange: (value: Permission[]) => void;
	disabled?: boolean;
	error?: string;
};

export function PermissionsField({ value, onChange, disabled, error }: PermissionsFieldProps) {
	const granted = MODULES.filter((module) => countGranted(value, module) > 0).length;
	const allGranted = granted === MODULES.length;

	/** Liga `ver` em todo módulo, ou limpa tudo — atalho para o caso comum. */
	const toggleAll = () => {
		onChange(allGranted ? [] : MODULES.map((module) => `${module}:ver` as Permission));
	};

	const handleToggle = (module: Module, action: StandardAction) => {
		onChange(togglePermission(value, module, action));
	};

	return (
		<div className="flex flex-col gap-3">
			<div className="flex items-center justify-between gap-4">
				<Label className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
					O que pode
				</Label>

				<div className="flex items-center gap-3">
					<span className="text-muted-foreground text-xs tabular-nums">
						{granted} de {MODULES.length}
					</span>
					<Button
						type="button"
						variant="ghost"
						size="sm"
						disabled={disabled}
						onClick={toggleAll}
						className="text-muted-foreground hover:text-foreground h-7 px-2 text-xs"
					>
						{allGranted ? 'Limpar' : 'Todos'}
					</Button>
				</div>
			</div>

			{/* `max-h` com scroll próprio mantém o rodapé do formulário sempre visível. */}
			<div className="max-h-80 overflow-y-auto">
				<div className="flex flex-col gap-4">
					{SECTORS.map((sector) => (
						<div key={sector} className="overflow-hidden rounded-lg border">
							{/*
							 * O cabeçalho some no celular: lá não há espaço para quatro
							 * colunas, e cada caixa leva o próprio rótulo ao lado.
							 */}
							<div className="bg-muted/40 text-muted-foreground hidden grid-cols-[minmax(0,1fr)_repeat(4,3.5rem)] gap-x-2 border-b px-3 py-1.5 text-[11px] font-medium sm:grid">
								<span>{sector}</span>
								{STANDARD_ACTIONS.map((action) => (
									<span key={action} className="text-center">
										{ACTION_LABELS[action]}
									</span>
								))}
							</div>

							<div className="text-muted-foreground bg-muted/40 border-b px-3 py-1.5 text-[11px] font-medium sm:hidden">
								{sector}
							</div>

							{PERMISSION_CATALOG.filter((item) => item.sector === sector).map((item) => (
								<PermissionRow
									key={item.module}
									item={item}
									permissions={value}
									disabled={disabled}
									onToggle={(action) => handleToggle(item.module, action)}
								/>
							))}
						</div>
					))}
				</div>
			</div>

			{error ? (
				<p role="alert" className="text-destructive text-sm">
					{error}
				</p>
			) : null}
		</div>
	);
}
