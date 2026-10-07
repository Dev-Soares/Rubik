import { Link, useRouterState } from '@tanstack/react-router';
import { ChevronRightIcon } from 'lucide-react';
import { useState } from 'react';
import { HoverCard as HoverCardPrimitive } from 'radix-ui';
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from '@/shared/components/ui/collapsible';
import {
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
	useSidebar,
} from '@/shared/components/ui/sidebar';
import { NAV_ACTIVE_CLASS, NAV_ACTIVE_PARENT_CLASS, NAV_ITEM_CLASS } from '@/shared/navigation';
import type { NavChildItem, NavItem } from '@/shared/types/navigation';

type NavGroupItemProps = {
	item: NavItem;
	onNavigate: () => void;
};

type NavGroupChildLinkProps = {
	child: NavChildItem;
	onNavigate: () => void;
};

/**
 * Sub-item do grupo. Mesmo link nos dois modos — expandido (dentro do
 * `SidebarMenuSub`) e recolhido (dentro do flyout) —, então vive aqui para as
 * duas ramificações não saírem de sincronia no estilo do ativo.
 */
function NavGroupChildLink({ child, onNavigate }: NavGroupChildLinkProps) {
	return (
		<SidebarMenuSubButton asChild className={`h-8 ${NAV_ITEM_CLASS}`}>
			<Link
				to={child.to}
				onClick={onNavigate}
				activeOptions={{ exact: true }}
				activeProps={{ className: NAV_ACTIVE_CLASS }}
				inactiveProps={{ className: 'text-foreground/70' }}
			>
				{({ isActive }) => (
					<>
						<child.icon className="size-4 shrink-0" strokeWidth={isActive ? 2.5 : 2} />
						<span>{child.label}</span>
					</>
				)}
			</Link>
		</SidebarMenuSubButton>
	);
}

/** Item de navegação com sub-itens: expande e recolhe na sidebar. */
export function NavGroupItem({ item, onNavigate }: NavGroupItemProps) {
	const { state, isMobile } = useSidebar();
	const pathname = useRouterState({ select: (s) => s.location.pathname });

	const hasActiveChild = item.children?.some((child) => pathname === child.to) ?? false;

	/*
	 * `null` = segue a rota; booleano = o usuário mandou abrir ou fechar. Assim
	 * navegar para uma filha expande o grupo sem prender o clique do usuário.
	 */
	const [userToggled, setUserToggled] = useState<boolean | null>(null);
	const isExpanded = userToggled ?? hasActiveChild;

	const [flyoutOpen, setFlyoutOpen] = useState(false);

	/*
	 * No mobile a sidebar é um drawer: abre em largura cheia e nunca chega ao
	 * modo ícone, então lá o grupo é sempre o collapsible normal.
	 */
	const isIconMode = state === 'collapsed' && !isMobile;

	/*
	 * Recolhida, a sidebar não tem espaço para os sub-itens: em vez de abrir a
	 * sidebar inteira, o grupo vira um flyout que aparece ao lado do ícone. O
	 * usuário alcança a rota filha sem perder o ganho de espaço do modo ícone.
	 *
	 * `openDelay={0}`: o flyout É a navegação aqui, não um extra informativo —
	 * esperar para revelar o único caminho até a rota filha faz a sidebar
	 * parecer travada. O `closeDelay` é o que importa, e segura o painel
	 * enquanto o cursor atravessa o vão entre o ícone e ele.
	 */
	if (isIconMode) {
		return (
			<SidebarMenuItem>
				<HoverCardPrimitive.Root
					openDelay={0}
					closeDelay={150}
					open={flyoutOpen}
					onOpenChange={setFlyoutOpen}
				>
					<HoverCardPrimitive.Trigger asChild>
						{/*
						 * O grupo não é uma rota e não deve parecer a aba atual — mas
						 * recolhido o ícone é a única pista de que há uma filha ativa
						 * aqui dentro, então aí ele acende.
						 */}
						<SidebarMenuButton
							/*
							 * O HoverCard abre no ponteiro e no foco, mas não no toque, e
							 * `isMobile` é largura: um tablet de 768px+ cai aqui com o
							 * flyout sendo o único caminho até a rota filha. O clique
							 * cobre o toque — e no desktop é inofensivo, já que o hover
							 * chega antes e deixa o estado já aberto.
							 */
							onClick={() => setFlyoutOpen(true)}
							className={`text-foreground/70 h-9 ${NAV_ITEM_CLASS} ${
								hasActiveChild ? NAV_ACTIVE_PARENT_CLASS : ''
							}`}
						>
							<item.icon className="size-4 shrink-0" strokeWidth={hasActiveChild ? 2.5 : 2} />
							<span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
						</SidebarMenuButton>
					</HoverCardPrimitive.Trigger>

					<HoverCardPrimitive.Portal>
						<HoverCardPrimitive.Content
							side="right"
							align="start"
							/*
							 * O vão entre o ícone e o painel é área morta: o cursor que
							 * sai do trigger passa por ele e o `closeDelay` sozinho não
							 * basta se for largo. 4px é curto o bastante para a travessia
							 * ser imediata.
							 */
							sideOffset={4}
							className="bg-sidebar text-sidebar-foreground z-50 min-w-48 origin-(--radix-hover-card-content-transform-origin) rounded-md border p-1 shadow-md data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 data-[side=right]:slide-in-from-left-2"
						>
							<div className="text-muted-foreground px-2 py-1.5 text-xs font-medium">
								{item.label}
							</div>

							{/*
							 * Sem a borda-guia do `SidebarMenuSub`: aqui não há um item pai
							 * acima para o traço ligar, ele ficaria solto no painel.
							 */}
							<ul className="flex flex-col gap-1">
								{item.children?.map((child) => (
									<li key={child.to}>
										<NavGroupChildLink
											child={child}
											// Sem fechar, o painel fica por cima da tela recém-aberta:
											// no toque não há cursor para sair e disparar o close.
											onNavigate={() => {
												setFlyoutOpen(false);
												onNavigate();
											}}
										/>
									</li>
								))}
							</ul>
						</HoverCardPrimitive.Content>
					</HoverCardPrimitive.Portal>
				</HoverCardPrimitive.Root>
			</SidebarMenuItem>
		);
	}

	return (
		<Collapsible asChild open={isExpanded} onOpenChange={setUserToggled}>
			<SidebarMenuItem>
				<CollapsibleTrigger asChild>
					{/*
					 * O grupo não é uma rota: nunca deve parecer a aba atual. O
					 * `data-open:hover` zera o fundo que o shadcn aplica no grupo expandido
					 * — sem ele o toque no celular deixa o item aceso.
					 */}
					<SidebarMenuButton
						tooltip={item.label}
						className={`text-foreground/70 data-open:hover:bg-sidebar-item-hover! h-9 ${NAV_ITEM_CLASS}`}
					>
						<item.icon className="size-4 shrink-0" strokeWidth={2} />
						<span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
						<ChevronRightIcon
							className={`ml-auto size-4 shrink-0 transition-transform duration-200 group-data-[collapsible=icon]:hidden ${
								isExpanded ? 'rotate-90' : ''
							}`}
						/>
					</SidebarMenuButton>
				</CollapsibleTrigger>

				<CollapsibleContent>
					<SidebarMenuSub>
						{item.children?.map((child) => (
							<SidebarMenuSubItem key={child.to}>
								<NavGroupChildLink child={child} onNavigate={onNavigate} />
							</SidebarMenuSubItem>
						))}
					</SidebarMenuSub>
				</CollapsibleContent>
			</SidebarMenuItem>
		</Collapsible>
	);
}
