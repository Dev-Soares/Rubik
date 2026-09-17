import { Link } from '@tanstack/react-router';
import { SidebarMenuButton, SidebarMenuItem } from '@/shared/components/ui/sidebar';
import type { NavItem } from '@/shared/types/navigation';
import { NAV_ACTIVE_CLASS } from '@/shared/navigation';

type NavLinkItemProps = {
	item: NavItem;
	onNavigate: () => void;
};

/** Item de navegação sem filhos. Usado no corpo e no rodapé da sidebar. */
export function NavLinkItem({ item, onNavigate }: NavLinkItemProps) {
	return (
		<SidebarMenuItem>
			<SidebarMenuButton
				asChild
				tooltip={item.label}
				// Zera o fundo que o shadcn aplica no hover/ativo: quem manda na cor
				// é o NAV_ACTIVE_CLASS, senão o item sob o cursor também fica azul e
				// parecem dois selecionados. `active:` entra junto porque no celular o
				// toque deixa o estado grudado depois de navegar.
				className="h-9 hover:bg-foreground/5 data-active:bg-transparent active:bg-transparent!"
			>
				<Link
					to={item.to}
					onClick={onNavigate}
					// `exact` evita que uma rota-pai fique ativa junto com a filha.
					activeOptions={{ exact: true }}
					activeProps={{ className: NAV_ACTIVE_CLASS }}
					inactiveProps={{ className: 'text-foreground/70' }}
				>
					{({ isActive }) => (
						<>
							<item.icon className="size-4 shrink-0" strokeWidth={isActive ? 2.5 : 2} />
							<span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
						</>
					)}
				</Link>
			</SidebarMenuButton>
		</SidebarMenuItem>
	);
}
