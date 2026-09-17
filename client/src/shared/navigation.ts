import {
	BookOpenIcon,
	HeadsetIcon,
	HouseIcon,
	IdCardIcon,
	ScrollTextIcon,
	ShieldIcon,
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
	{ label: 'Suporte ao vivo', to: '/support', icon: HeadsetIcon },
];

/**
 * Estilo do item ativo: fundo e texto na cor primária, em negrito.
 * Os `!` sobrescrevem o fundo neutro que o SidebarMenuButton aplica.
 */
export const NAV_ACTIVE_CLASS =
	'bg-primary/15! text-primary font-bold hover:bg-primary/20! hover:text-primary!';
