import { cn } from 'cn';
import { RoleBadge } from '@/modules/roles/components/RoleBadge';
import { ROLE_COLORS, ROLE_ICONS, type RoleColor, type RoleIcon } from '@/modules/roles/types/role';
import {
	ROLE_COLOR_LABELS,
	ROLE_COLOR_SWATCHES,
	ROLE_ICON_COMPONENTS,
	ROLE_ICON_LABELS,
} from '@/modules/roles/utils/badge';
import { Label } from '@/shared/components/ui/label';

type BadgeFieldProps = {
	name: string;
	color: RoleColor;
	icon: RoleIcon;
	onColorChange: (color: RoleColor) => void;
	onIconChange: (icon: RoleIcon) => void;
	disabled?: boolean;
};

/**
 * Cor e ícone do crachá, com a prévia ao lado do rótulo: a escolha é visual,
 * então o resultado precisa estar à vista enquanto se clica.
 */
export function BadgeField({
	name,
	color,
	icon,
	onColorChange,
	onIconChange,
	disabled,
}: BadgeFieldProps) {
	return (
		<div className="flex flex-col gap-3">
			<div className="flex items-center justify-between gap-4">
				<Label className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
					Crachá
				</Label>

				{/* Menor que no card: aqui é prévia ao lado de um rótulo, não título. */}
				<RoleBadge
					name={name.trim() || 'Cargo'}
					color={color}
					icon={icon}
					className="gap-1.5 text-sm"
				/>
			</div>

			<div className="flex flex-wrap gap-1.5">
				{ROLE_COLORS.map((option) => (
					<button
						key={option}
						type="button"
						onClick={() => onColorChange(option)}
						disabled={disabled}
						aria-pressed={color === option}
						aria-label={ROLE_COLOR_LABELS[option]}
						title={ROLE_COLOR_LABELS[option]}
						className={cn(
							'size-7 rounded-full border-2 transition-colors disabled:opacity-50',
							ROLE_COLOR_SWATCHES[option],
							color === option ? 'border-foreground' : 'border-transparent',
						)}
					/>
				))}
			</div>

			<div className="flex flex-wrap gap-1.5">
				{ROLE_ICONS.map((option) => {
					const Icon = ROLE_ICON_COMPONENTS[option];

					return (
						<button
							key={option}
							type="button"
							onClick={() => onIconChange(option)}
							disabled={disabled}
							aria-pressed={icon === option}
							aria-label={ROLE_ICON_LABELS[option]}
							title={ROLE_ICON_LABELS[option]}
							className={cn(
								'inline-flex size-9 items-center justify-center rounded-md border transition-colors disabled:opacity-50',
								icon === option
									? 'border-primary/40 bg-primary/15 text-primary'
									: 'border-transparent bg-muted/50 text-muted-foreground hover:text-foreground',
							)}
						>
							<Icon className="size-4" />
						</button>
					);
				})}
			</div>
		</div>
	);
}
