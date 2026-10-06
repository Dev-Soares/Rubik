import { ModulePermissionCard } from '@/modules/roles/components/ModulePermissionCard';
import { MODULES, type Action, type Module, type Permission } from '@/modules/roles/types/role';
import { countGranted, toggleModule, togglePermission } from '@/modules/roles/utils';
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

	const handleAction = (module: Module, action: Action) => {
		onChange(togglePermission(value, module, action));
	};

	return (
		<div className="flex flex-col gap-3">
			<div className="flex items-center justify-between gap-4">
				<Label className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
					Acesso aos módulos
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

			{/*
			 * Coluna única: cada card já tem até quatro botões de ação lado a lado,
			 * e em duas colunas eles ficariam estreitos demais no celular. `max-h`
			 * com scroll próprio mantém o rodapé do formulário sempre visível.
			 */}
			<div className="max-h-72 overflow-y-auto">
				<div className="flex flex-col gap-2">
					{MODULES.map((module) => (
						<ModulePermissionCard
							key={module}
							module={module}
							permissions={value}
							disabled={disabled}
							onToggleAction={(action) => handleAction(module, action)}
							onToggleModule={() => onChange(toggleModule(value, module))}
						/>
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
