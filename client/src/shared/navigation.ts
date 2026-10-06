import {
	BookOpenIcon,
	CircleQuestionMarkIcon,
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
	// Sem `module`: é a tela que todo usuário autenticado enxerga.
	{ label: 'Início', to: '/inicio', icon: HouseIcon },
	{
		label: 'Administração',
		to: '/admin',
		icon: ShieldIcon,
		children: [
			{ label: 'Usuários', to: '/admin/users', icon: UsersIcon, module: 'usuarios' },
			{ label: 'Cargos', to: '/admin/roles', icon: IdCardIcon, module: 'cargos' },
			{
				label: 'Registro de uso',
				to: '/admin/audit',
				icon: ScrollTextIcon,
				module: 'auditoria',
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
	{ label: 'Suporte', to: '/tickets', icon: CircleQuestionMarkIcon, adminOnly: true },
];

/**
 * Estilo do item ativo: fundo sólido na cor primária, texto e ícone no
 * contraste dela, em negrito.
 *
 * O fundo cheio é o que separa o item atual do item sob o cursor — tingido, os
 * dois ficam no mesmo tom e a aba selecionada some na lista.
 *
 * Os `!` sobrescrevem o fundo neutro que o SidebarMenuButton aplica. O
 * `[&>svg]` existe porque o SidebarMenuSubButton pinta o ícone por seletor
 * filho (`[&>svg]:text-sidebar-accent-foreground`): herança não alcança isso, e
 * sem o par aqui o ícone do sub-item ativo fica na cor do shadcn sobre o pill.
 *
 * `data-active:` e `active:` repetem o fundo porque o NAV_ITEM_CLASS os zera
 * (ver lá embaixo). Entre dois `!`, a especificidade da variante é que decide —
 * um `bg-primary!` simples perde para `data-active:bg-transparent!` e o item
 * atual fica com o texto claro sobre fundo nenhum.
 */
export const NAV_ACTIVE_CLASS =
	'bg-primary! data-active:bg-primary! active:bg-primary! text-primary-foreground! font-bold hover:bg-primary! hover:text-primary-foreground! [&>svg]:text-primary-foreground!';

/**
 * Grupo recolhido que guarda a rota atual. Não leva o pill cheio do
 * NAV_ACTIVE_CLASS: o grupo não é uma rota, e com o mesmo tratamento do item
 * ativo o ícone do pai competiria com a aba de verdade. Tingido, ele só aponta
 * onde a rota atual está sem se passar por ela.
 */
export const NAV_ACTIVE_PARENT_CLASS =
	'bg-primary/15! data-active:bg-primary/15! active:bg-primary/15! text-primary! font-bold';

/**
 * Fundo do item sob o cursor. Vale para tudo que é clicável na sidebar —
 * item de navegação, grupo, sub-item e o card de perfil no rodapé.
 *
 * O `!` é obrigatório: o `SidebarMenuButton` traz `hover:bg-sidebar-accent`, e
 * o Tailwind emite essa classe DEPOIS desta no arquivo final. Mesma
 * especificidade, última ganha — sem o `!` o item não selecionado acende no
 * tom de destaque do shadcn e este valor nunca chega a ser aplicado.
 */
export const NAV_HOVER_CLASS = 'hover:bg-foreground/10!';

/**
 * Base dos itens de navegação (plano, grupo e sub-item).
 *
 * O `transition-[width,height,padding]` do SidebarMenuButton não inclui cor,
 * então sem `transition-colors` o hover entra e sai seco. O
 * `hover:text-foreground!` segura o texto: o padrão do shadcn é saltar para
 * `sidebar-accent-foreground`, e a troca de cor no mesmo frame do fundo é o que
 * faz o hover parecer forte demais. Leva `!` pelo mesmo motivo do fundo — a
 * classe do shadcn é emitida depois desta.
 *
 * `data-active:bg-transparent` zera o fundo do shadcn — quem pinta o ativo é o
 * NAV_ACTIVE_CLASS, senão o item sob o cursor também acende e parecem dois
 * selecionados. `active:` entra junto porque no celular o toque deixa o estado
 * grudado depois de navegar. Por isso o NAV_ACTIVE_CLASS repete o fundo nessas
 * duas variantes: aqui elas vencem um `bg-*` sem variante, mesmo com `!`.
 */
export const NAV_ITEM_CLASS = `transition-colors duration-150 ${NAV_HOVER_CLASS} hover:text-foreground! data-active:bg-transparent! active:bg-transparent!`;
