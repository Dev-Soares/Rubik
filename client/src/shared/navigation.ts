import {
	BookOpenIcon,
	HouseIcon,
	IdCardIcon,
	ScrollTextIcon,
	ShieldIcon,
	TicketIcon,
	UsersIcon,
} from 'lucide-react';
import type { NavItem } from '@/shared/types/navigation';

/**
 * Itens da sidebar. Adicione a rota nova aqui ao criá-la em `routes/`.
 *
 * `/profile` fica de fora: o acesso é pelo card do usuário no rodapé.
 */
export const NAV_ITEMS: NavItem[] = [
	// Sem `screen`: é a tela que todo usuário autenticado enxerga.
	{ label: 'Início', to: '/inicio', icon: HouseIcon },
	{
		label: 'Administração',
		to: '/admin',
		icon: ShieldIcon,
		children: [
			{ label: 'Usuários', to: '/admin/users', icon: UsersIcon, screen: 'admin.users' },
			{ label: 'Cargos', to: '/admin/roles', icon: IdCardIcon, screen: 'admin.roles' },
			{
				label: 'Registro de uso',
				to: '/admin/audit',
				icon: ScrollTextIcon,
				screen: 'admin.audit',
			},
		],
	},
];

/**
 * Itens fixos no rodapé da sidebar, acima do card do usuário. Ficam aqui os
 * itens de apoio — que se consulta —, não as abas de trabalho.
 */
export const NAV_FOOTER_ITEMS: NavItem[] = [
	{ label: 'Como usar', to: '/guide', icon: BookOpenIcon },
	{ label: 'Solicitar ajuda', to: '/tickets', icon: TicketIcon },
];

/**
 * Estilo do item ativo: fundo e texto na cor primária, em negrito.
 * Os `!` sobrescrevem o fundo neutro que o SidebarMenuButton aplica.
 */
export const NAV_ACTIVE_CLASS =
	'bg-primary/15! text-primary font-bold hover:bg-primary/20! hover:text-primary!';

/**
 * Base dos itens de navegação (plano, grupo e sub-item).
 *
 * O `transition-[width,height,padding]` do SidebarMenuButton não inclui cor,
 * então sem `transition-colors` o hover entra e sai seco. O
 * `hover:text-foreground` segura o texto: o padrão do shadcn é saltar para
 * `sidebar-accent-foreground`, e a troca de cor no mesmo frame do fundo é o que
 * faz o hover parecer forte demais.
 *
 * `data-active:bg-transparent` zera o fundo do shadcn — quem pinta o ativo é o
 * NAV_ACTIVE_CLASS, senão o item sob o cursor também acende e parecem dois
 * selecionados. `active:` entra junto porque no celular o toque deixa o estado
 * grudado depois de navegar.
 */
export const NAV_ITEM_CLASS =
	'transition-colors duration-150 hover:bg-foreground/5 hover:text-foreground data-active:bg-transparent active:bg-transparent!';
