import { InfoIcon, LockIcon } from 'lucide-react';
import { RolePickerOption } from '@/modules/roles/components/RolePickerOption';
import type { Role } from '@/modules/roles/types/role';
import { Label } from '@/shared/components/ui/label';

type RolePickerFieldProps = {
	label: string;
	roles: Role[];
	value: string[];
	onChange: (value: string[]) => void;
	onBlur?: () => void;
	name?: string;
	error?: string;
	hint?: string;
	/** `true` quando o `hint` explica uma trava, e não como os cargos somam. */
	hintIsRestriction?: boolean;
	disabled?: boolean;
};

/**
 * Escolha dos cargos de um usuário.
 *
 * Existe em vez do `CheckboxGroupField` porque a escolha precisa do traço do
 * cargo — cor e ícone —, e o campo genérico só conhece rótulo e descrição.
 */
export function RolePickerField({
	label,
	roles,
	value,
	onChange,
	onBlur,
	name,
	error,
	hint,
	hintIsRestriction,
	disabled,
}: RolePickerFieldProps) {
	const fieldId = name ?? label;

	function toggle(roleName: string, checked: boolean) {
		// Reordena pela lista de cargos: a ordem do CSV não depende de quem clicou primeiro.
		const selected = new Set(value);

		if (checked) {
			selected.add(roleName);
		} else {
			selected.delete(roleName);
		}

		onChange(roles.map((role) => role.name).filter((role) => selected.has(role)));
	}

	return (
		<div className="flex flex-col gap-2">
			<div className="flex items-baseline justify-between gap-2">
				<Label
					id={`${fieldId}-label`}
					className="text-muted-foreground text-xs font-semibold tracking-wider uppercase"
				>
					{label}
				</Label>

				{/* A contagem responde "quantos marquei?" sem recontar a lista. */}
				<span className="text-muted-foreground text-xs">
					{value.length} de {roles.length}
				</span>
			</div>

			<div
				role="group"
				aria-labelledby={`${fieldId}-label`}
				aria-describedby={error ? `${fieldId}-error` : undefined}
				className="flex flex-col gap-1 rounded-lg border p-1"
			>
				{roles.map((role) => (
					<RolePickerOption
						key={role.id}
						id={`${fieldId}-${role.name}`}
						role={role}
						checked={value.includes(role.name)}
						onCheckedChange={(checked) => toggle(role.name, checked)}
						onBlur={onBlur}
						disabled={disabled}
						invalid={Boolean(error)}
					/>
				))}
			</div>

			{error ? (
				<span id={`${fieldId}-error`} role="alert" className="text-destructive text-xs">
					{error}
				</span>
			) : hint ? (
				/*
				 * Mais forte que o `hint` do `FormField`: aqui não é um aparte sobre um
				 * campo, é a regra de como os cargos se combinam — quem não a lê marca
				 * dois cargos sem saber que as telas somam.
				 */
				<p className="bg-muted/60 text-muted-foreground flex items-start gap-2 rounded-lg p-2.5 text-xs">
					{/*
					 * Pelo sentido da frase, não por `disabled`: o campo também fica
					 * desabilitado durante o salvamento, e ali o cadeado mentiria.
					 */}
					{hintIsRestriction ? (
						<LockIcon className="mt-px size-3.5 shrink-0" />
					) : (
						<InfoIcon className="mt-px size-3.5 shrink-0" />
					)}
					{hint}
				</p>
			) : null}
		</div>
	);
}
