import { cn } from '@/shared/lib/utils';
import type { RoleColor, RoleIcon } from '@/modules/roles/types/role';
import { ROLE_COLOR_CLASSES, ROLE_ICON_COMPONENTS } from '@/modules/roles/utils/badge';

type RoleBadgeProps = {
	name: string;
	color: RoleColor;
	icon: RoleIcon;
	className?: string;
};

/**
 * O crachá de um cargo: o ícone e o nome, na cor que o administrador escolheu.
 *
 * Sem fundo e sem moldura — o nome é o título do card, então ganha o tamanho
 * de um; a cor fica no texto e no ícone.
 */
export function RoleBadge({ name, color, icon, className }: RoleBadgeProps) {
	const Icon = ROLE_ICON_COMPONENTS[icon] ?? ROLE_ICON_COMPONENTS.pessoa;

	return (
		<span
			className={cn(
				'inline-flex items-center gap-2 text-lg font-bold tracking-tight capitalize',
				ROLE_COLOR_CLASSES[color] ?? ROLE_COLOR_CLASSES.neutral,
				className,
			)}
		>
			{/* `1.1em`: o ícone acompanha o tamanho do texto, que muda por `className`. */}
			<Icon className="size-[1.1em] shrink-0" strokeWidth={2.5} />
			<span className="truncate">{name}</span>
		</span>
	);
}
