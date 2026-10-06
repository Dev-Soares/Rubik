import {
	BookOpenIcon,
	BriefcaseIcon,
	ChartColumnIcon,
	KeyIcon,
	SettingsIcon,
	ShieldIcon,
	StarIcon,
	TagIcon,
	UserIcon,
	UsersIcon,
	type LucideIcon,
} from 'lucide-react';
import type { RoleColor, RoleIcon } from '@/modules/roles/types/role';

/**
 * O crachá de um cargo: o tipo guarda só a chave da cor e do ícone; o desenho
 * de cada um mora aqui. É o que permite trocar o traço sem migrar o banco.
 */

export const ROLE_ICON_COMPONENTS: Record<RoleIcon, LucideIcon> = {
	escudo: ShieldIcon,
	chave: KeyIcon,
	estrela: StarIcon,
	pessoa: UserIcon,
	pessoas: UsersIcon,
	maleta: BriefcaseIcon,
	engrenagem: SettingsIcon,
	grafico: ChartColumnIcon,
	livro: BookOpenIcon,
	etiqueta: TagIcon,
};

export const ROLE_ICON_LABELS: Record<RoleIcon, string> = {
	escudo: 'Escudo',
	chave: 'Chave',
	estrela: 'Estrela',
	pessoa: 'Pessoa',
	pessoas: 'Pessoas',
	maleta: 'Maleta',
	engrenagem: 'Engrenagem',
	grafico: 'Gráfico',
	livro: 'Livro',
	etiqueta: 'Etiqueta',
};

/**
 * O fundo suave e o texto na cor do cargo.
 *
 * `primary` sai do token do tema; as demais são da paleta do Tailwind com
 * `dark:` explícito. O tema escuro do template é automático pelos tokens, mas
 * estas cores não têm token — sem o par claro/escuro o texto sumiria no fundo.
 */
export const ROLE_COLOR_CLASSES: Record<RoleColor, string> = {
	primary: 'bg-primary/10 text-primary',
	blue: 'bg-blue-500/10 text-blue-700 dark:text-blue-300',
	green: 'bg-green-500/10 text-green-700 dark:text-green-300',
	amber: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
	red: 'bg-red-500/10 text-red-700 dark:text-red-300',
	purple: 'bg-purple-500/10 text-purple-700 dark:text-purple-300',
	neutral: 'bg-foreground/5 text-foreground',
};

/** O preenchimento chapado, para a bolinha do seletor de cor. */
export const ROLE_COLOR_SWATCHES: Record<RoleColor, string> = {
	primary: 'bg-primary',
	blue: 'bg-blue-500',
	green: 'bg-green-500',
	amber: 'bg-amber-500',
	red: 'bg-red-500',
	purple: 'bg-purple-500',
	neutral: 'bg-foreground/40',
};

export const ROLE_COLOR_LABELS: Record<RoleColor, string> = {
	primary: 'Padrão',
	blue: 'Azul',
	green: 'Verde',
	amber: 'Âmbar',
	red: 'Vermelho',
	purple: 'Roxo',
	neutral: 'Cinza',
};
