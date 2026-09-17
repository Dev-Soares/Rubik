import { Link, useRouterState } from '@tanstack/react-router';
import { ChevronRightIcon } from 'lucide-react';
import { useState } from 'react';
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
import { NAV_ACTIVE_CLASS } from '@/shared/navigation';
import type { NavItem } from '@/shared/types/navigation';

type NavGroupItemProps = {
	item: NavItem;
	onNavigate: () => void;
};

/** Item de navegação com sub-itens: expande e recolhe na sidebar. */
export function NavGroupItem({ item, onNavigate }: NavGroupItemProps) {
	const { state, setOpen } = useSidebar();
	const pathname = useRouterState({ select: (s) => s.location.pathname });

	const hasActiveChild = item.children?.some((child) => pathname === child.to) ?? false;

	/*
	 * `null` = segue a rota; booleano = o usuário mandou abrir ou fechar. Assim
	 * navegar para uma filha expande o grupo sem prender o clique do usuário.
	 */
	const [userToggled, setUserToggled] = useState<boolean | null>(null);
	const isExpanded = userToggled ?? hasActiveChild;

	/*
	 * Colapsada, a sidebar não tem espaço para os sub-itens: clicar no grupo
	 * abre a sidebar em vez de expandir no lugar.
	 */
	const handleOpenChange = (open: boolean) => {
		if (state === 'collapsed') {
			setOpen(true);
			setUserToggled(true);
			return;
		}

		setUserToggled(open);
	};

	return (
		<Collapsible asChild open={isExpanded} onOpenChange={handleOpenChange}>
			<SidebarMenuItem>
				<CollapsibleTrigger asChild>
					{/*
					 * O grupo não é uma rota: nunca deve parecer a aba atual. Os `!` zeram
					 * o fundo que o shadcn aplica em `active` e em `data-open:hover` —
					 * sem eles o toque no celular deixa o item aceso.
					 */}
					<SidebarMenuButton
						tooltip={item.label}
						className="text-foreground/70 hover:bg-foreground/5 h-9 active:bg-transparent! data-open:hover:bg-foreground/5!"
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
								<SidebarMenuSubButton
									asChild
									// Mesmo motivo do item plano: quem pinta o ativo é o
									// NAV_ACTIVE_CLASS, senão hover e ativo se confundem.
									className="h-8 hover:bg-foreground/5 data-active:bg-transparent active:bg-transparent!"
								>
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
							</SidebarMenuSubItem>
						))}
					</SidebarMenuSub>
				</CollapsibleContent>
			</SidebarMenuItem>
		</Collapsible>
	);
}
