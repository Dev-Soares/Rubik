import { ScreenGrantCard } from '@/modules/roles/components/ScreenGrantCard';
import { SCREENS, type ScreenGrant, type ScreenPermission } from '@/modules/roles/types/role';
import { toGrantByScreen, toPermissions } from '@/modules/roles/utils';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';

type ScreensFieldProps = {
	value: ScreenPermission[];
	onChange: (value: ScreenPermission[]) => void;
	disabled?: boolean;
	error?: string;
};

export function ScreensField({ value, onChange, disabled, error }: ScreensFieldProps) {
	const grants = toGrantByScreen(value);
	const granted = SCREENS.filter((screen) => grants[screen] !== 'none').length;
	const allGranted = granted === SCREENS.length;

	const change = (screen: (typeof SCREENS)[number], grant: ScreenGrant) => {
		onChange(toPermissions({ ...grants, [screen]: grant }));
	};

	/** Liga tudo em `read` ou desliga tudo — atalho para o caso comum. */
	const toggleAll = () => {
		const grant: ScreenGrant = allGranted ? 'none' : 'read';
		onChange(toPermissions(Object.fromEntries(SCREENS.map((s) => [s, grant])) as typeof grants));
	};

	return (
		<div className="flex flex-col gap-3">
			<div className="flex items-center justify-between gap-4">
				<Label className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
					Acesso às telas
				</Label>

				<div className="flex items-center gap-3">
					<span className="text-muted-foreground text-xs tabular-nums">
						{granted} de {SCREENS.length}
					</span>
					<Button
						type="button"
						variant="ghost"
						size="sm"
						disabled={disabled}
						onClick={toggleAll}
						className="text-muted-foreground hover:text-foreground h-7 px-2 text-xs"
					>
						{allGranted ? 'Limpar' : 'Todas'}
					</Button>
				</div>
			</div>

			{/*
			 * Grade de duas colunas: a lista de telas cresce com o produto, e em
			 * coluna única o modal passa da altura da janela cedo demais. `max-h` com
			 * scroll próprio mantém o rodapé do formulário sempre visível.
			 */}
			<div className="max-h-64 overflow-y-auto">
				<div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
					{SCREENS.map((screen) => (
						<ScreenGrantCard
							key={screen}
							screen={screen}
							grant={grants[screen]}
							disabled={disabled}
							onChange={(grant) => change(screen, grant)}
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
