import { Link } from '@tanstack/react-router';
import { SidebarMenuButton, SidebarMenuItem } from '@/shared/components/ui/sidebar';
import type { NavItem } from '@/shared/types/navigation';
import { NAV_ACTIVE_CLASS, NAV_ITEM_CLASS } from '@/shared/navigation';

type NavLinkItemProps = {
	item: NavItem;
	onNavigate: () => void;
};

/** Item de navegação sem filhos. Usado no corpo e no rodapé da sidebar. */
export function NavLinkItem({ item, onNavigate }: NavLinkItemProps) {
	return (
		<SidebarMenuItem>
			<SidebarMenuButton asChild tooltip={item.label} className={`h-9 ${NAV_ITEM_CLASS}`}>
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
