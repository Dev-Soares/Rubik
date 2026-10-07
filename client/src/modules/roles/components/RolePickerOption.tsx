import { cn } from 'cn';
import type { Role } from '@/modules/roles/types/role';
import {
	ROLE_COLOR_CLASSES,
	ROLE_COLOR_SELECTED,
	ROLE_ICON_COMPONENTS,
} from '@/modules/roles/utils/badge';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Label } from '@/shared/components/ui/label';

type RolePickerOptionProps = {
	role: Role;
	checked: boolean;
	onCheckedChange: (checked: boolean) => void;
	onBlur?: () => void;
	disabled?: boolean;
	invalid?: boolean;
	/** `id` do input, para o `htmlFor` do rótulo e o `aria` do grupo. */
	id: string;
};

/**
 * Um cargo na lista de escolha: o ícone e a cor que o administrador deu ao
 * cargo, para que `user` e `admin` não se pareçam no único lugar em que a
 * diferença entre eles importa.
 */
export function RolePickerOption({
	role,
	checked,
	onCheckedChange,
	onBlur,
	disabled,
	invalid,
	id,
}: RolePickerOptionProps) {
	const Icon = ROLE_ICON_COMPONENTS[role.icon] ?? ROLE_ICON_COMPONENTS.pessoa;

	return (
		<Label
			htmlFor={id}
			className={cn(
				'flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 font-normal transition-colors',
				checked
					? ROLE_COLOR_SELECTED[role.color] ?? ROLE_COLOR_SELECTED.neutral
					: 'hover:bg-muted border-transparent',
				disabled && 'cursor-not-allowed opacity-60',
			)}
		>
			<Checkbox
				id={id}
				checked={checked}
				onCheckedChange={(next) => onCheckedChange(next === true)}
				onBlur={onBlur}
				disabled={disabled}
				aria-invalid={invalid}
			/>

			<span
				className={cn(
					'flex size-8 shrink-0 items-center justify-center rounded-md',
					checked ? 'bg-background' : 'bg-muted',
					ROLE_COLOR_CLASSES[role.color] ?? ROLE_COLOR_CLASSES.neutral,
				)}
			>
				<Icon className="size-4" strokeWidth={2.5} />
			</span>

			<span className="flex min-w-0 flex-col gap-0.5">
				<span
					className={cn(
						'text-sm leading-snug font-semibold capitalize',
						checked
							? ROLE_COLOR_CLASSES[role.color] ?? ROLE_COLOR_CLASSES.neutral
							: 'text-foreground',
					)}
				>
					{role.name}
				</span>
				{role.description ? (
					<span className="text-muted-foreground text-xs leading-snug">{role.description}</span>
				) : null}
			</span>
		</Label>
	);
}
