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
 * Estilo do item ativo: fundo avermelhado, texto e ícone na cor da marca, em
 * negrito.
 *
 * As cores vêm de token (`--sidebar-item-active`), não de `primary` com
 * opacidade. **A opacidade que funciona depende do tema**, e é por isso que
 * tentativa anterior de usar `bg-primary/12` não aparecia: sobre a sidebar
 * escura, 12% de um vermelho escuro move a luminância em 0.027 — contra 0.096
 * no tema claro, com a mesma classe. O token resolve o valor uma vez por tema
 * (ver `global.css`), e a classe aqui fica sem número.
 *
 * Os `!` sobrescrevem o fundo que o SidebarMenuButton aplica no item
 * selecionado. O `[&>svg]` existe porque o SidebarMenuSubButton pinta o ícone
 * por seletor filho (`[&>svg]:text-sidebar-accent-foreground`): herança não
 * alcança isso, e sem o par aqui o ícone do sub-item ativo fica na cor do
 * shadcn.
 *
 * O `hover:` repete o fundo do ativo de propósito: sem ele o item atual trocaria
 * para a cor do hover ao passar o cursor e pareceria ter sido deselecionado.
 *
 * E vai escrito como `[&]:hover:` porque disputa com o `hover:` do
 * NAV_HOVER_CLASS: os dois têm `!important` e a mesma especificidade, então
 * venceria o que o Tailwind emitisse por último — e a ordem de emissão é
 * alfabética, fora do nosso controle (`item-hover` sai depois de
 * `item-active`). O `[&]` duplica a classe no seletor e resolve a disputa pela
 * especificidade, que não depende de ordem.
 */
export const NAV_ACTIVE_CLASS =
	'bg-sidebar-item-active! [&]:hover:bg-sidebar-item-active! text-sidebar-item-active-foreground! [&]:hover:text-sidebar-item-active-foreground! [&>svg]:text-sidebar-item-active-foreground! font-bold';

/**
 * Grupo recolhido que guarda a rota atual. Só existe no modo ícone: ali a aba
 * de verdade está escondida dentro do flyout, e sem isto nada na sidebar
 * indicaria onde o usuário está. Expandido, o grupo não recebe tratamento
 * nenhum — quem acende é a filha, visível logo abaixo.
 */
export const NAV_ACTIVE_PARENT_CLASS =
	'bg-sidebar-item-active! text-sidebar-item-active-foreground! font-bold';

/**
 * Fundo do item sob o cursor. Vale para tudo que é clicável na sidebar —
 * item de navegação, grupo, sub-item e o card de perfil no rodapé.
 *
 * Avermelhado, e não cinza: o hover vira uma prévia do ativo, no mesmo matiz e
 * num tom abaixo. O cinza neutro lia como estado desligado e brigava com o
 * vermelho do item atual logo acima ou abaixo na lista.
 *
 * Token em vez de `primary` com opacidade, pelo motivo explicado no
 * NAV_ACTIVE_CLASS: a opacidade visível no tema claro desaparece no escuro.
 *
 * O `!` é obrigatório: o `SidebarMenuButton` traz `hover:bg-sidebar-accent`, e
 * o Tailwind emite essa classe DEPOIS desta no arquivo final. Mesma
 * especificidade, última ganha — sem o `!` o item não selecionado acende no
 * tom de destaque do shadcn e este valor nunca chega a ser aplicado.
 */
export const NAV_HOVER_CLASS = 'hover:bg-sidebar-item-hover!';

/**
 * Base dos itens de navegação (plano, grupo e sub-item).
 *
 * O `transition-[width,height,padding]` do SidebarMenuButton não inclui cor,
 * então sem `transition-colors` o hover entra e sai seco.
 *
 * O texto do hover usa o MESMO token do texto do item ativo, e não `primary`:
 * sobre o fundo do hover, `primary` puro dá 4.49:1 no tema claro e 3.08:1 no
 * escuro — abaixo de AA nos dois. O token já é a cor da marca ajustada para
 * contraste (6.56:1 e 10.36:1). Com ele o hover vira uma prévia do ativo: mesma
 * cor de texto, fundo um tom abaixo. Leva `!` para vencer o
 * `sidebar-accent-foreground` do shadcn, emitido depois desta classe.
 *
 * Esta constante já teve `data-active:bg-transparent!`, para derrubar o fundo
 * que o shadcn pintava no item selecionado. Era remendo sobre remendo: o
 * `data-active:` do Tailwind casa com a presença do atributo, e o
 * `SidebarMenuButton` marca `data-active="false"` em todo item — então aquela
 * classe, com `!important`, zerava o fundo da sidebar inteira e qualquer `bg-*`
 * aplicado depois perdia a disputa. Era por isso que trocar a cor do hover
 * nunca surtia efeito: a cor estava certa, mas nenhuma chegava a pintar.
 *
 * A causa foi corrigida na origem (ver o cabeçalho de `ui/sidebar.tsx`), então
 * aqui não é mais preciso zerar fundo nenhum.
 */
export const NAV_ITEM_CLASS = `transition-colors duration-150 ${NAV_HOVER_CLASS} hover:text-sidebar-item-active-foreground! hover:[&>svg]:text-sidebar-item-active-foreground!`;
