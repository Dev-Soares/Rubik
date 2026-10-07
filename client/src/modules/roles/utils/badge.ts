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
 * O texto e o ícone na cor do cargo. Sem fundo: o crachá é o nome do cargo em
 * destaque, e uma pastilha colorida competia com o resto do card.
 *
 * `primary` sai do token do tema; as demais são da paleta do Tailwind com
 * `dark:` explícito. O tema escuro do template é automático pelos tokens, mas
 * estas cores não têm token — sem o par claro/escuro o texto sumiria no fundo.
 */
export const ROLE_COLOR_CLASSES: Record<RoleColor, string> = {
	primary: 'text-primary',
	blue: 'text-blue-700 dark:text-blue-300',
	green: 'text-green-700 dark:text-green-300',
	amber: 'text-amber-700 dark:text-amber-300',
	red: 'text-red-700 dark:text-red-300',
	purple: 'text-purple-700 dark:text-purple-300',
	neutral: 'text-foreground',
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

/**
 * A moldura e o fundo tênue do cargo escolhido no seletor de cargos.
 *
 * Mesmo motivo do `ROLE_COLOR_CLASSES` para o `dark:` explícito: estas cores
 * não têm token de tema, e sem o par claro/escuro o cargo marcado sumiria.
 */
export const ROLE_COLOR_SELECTED: Record<RoleColor, string> = {
	primary: 'border-primary bg-primary/5',
	blue: 'border-blue-500 bg-blue-500/5 dark:border-blue-400',
	green: 'border-green-500 bg-green-500/5 dark:border-green-400',
	amber: 'border-amber-500 bg-amber-500/5 dark:border-amber-400',
	red: 'border-red-500 bg-red-500/5 dark:border-red-400',
	purple: 'border-purple-500 bg-purple-500/5 dark:border-purple-400',
	neutral: 'border-foreground/40 bg-foreground/5',
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
