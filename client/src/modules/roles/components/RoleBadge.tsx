import { cn } from 'cn';
import type { RoleColor, RoleIcon } from '@/modules/roles/types/role';
import { ROLE_COLOR_CLASSES, ROLE_ICON_COMPONENTS } from '@/modules/roles/utils/badge';

type RoleBadgeProps = {
	name: string;
	color: RoleColor;
	icon: RoleIcon;
	className?: string;
};

/** O crachá de um cargo: o ícone e o nome, na cor que o administrador escolheu. */
export function RoleBadge({ name, color, icon, className }: RoleBadgeProps) {
	const Icon = ROLE_ICON_COMPONENTS[icon] ?? ROLE_ICON_COMPONENTS.pessoa;

	return (
		<span
			className={cn(
				'inline-flex h-6 items-center gap-1.5 rounded-md px-2 text-sm font-semibold capitalize',
				ROLE_COLOR_CLASSES[color] ?? ROLE_COLOR_CLASSES.neutral,
				className,
			)}
		>
			<Icon className="size-3.5 shrink-0" strokeWidth={2.5} />
			<span className="truncate">{name}</span>
		</span>
	);
}
