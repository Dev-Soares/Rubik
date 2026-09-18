import { Link } from '@tanstack/react-router';
import { SidebarMenuButton, SidebarMenuItem } from '@/shared/components/ui/sidebar';
import type { NavItem } from '@/shared/types/navigation';
import { NAV_ACTIVE_CLASS, NAV_ITEM_CLASS } from '@/shared/navigation';
import { formatBadgeCount } from '@/shared/utils/badge';

type NavLinkItemProps = {
	item: NavItem;
	/** Quantidade de novidades; `0` não mostra aviso. */
	badge?: number;
	onNavigate: () => void;
};

/** Item de navegação sem filhos. Usado no corpo e no rodapé da sidebar. */
export function NavLinkItem({ item, badge = 0, onNavigate }: NavLinkItemProps) {
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
							<span className="relative shrink-0">
								<item.icon className="size-4" strokeWidth={isActive ? 2.5 : 2} />

								{/* Com a sidebar recolhida só o ícone aparece: o ponto sobre ele
								 * mantém o aviso visível, já que o número fica escondido. */}
								{badge > 0 ? (
									<span className="bg-destructive absolute -top-0.5 -right-0.5 size-2 rounded-full group-data-[collapsible=icon]:block hidden" />
								) : null}
							</span>

							<span className="group-data-[collapsible=icon]:hidden">{item.label}</span>

							{badge > 0 ? (
								<span className="bg-destructive text-destructive-foreground ml-auto flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] leading-none font-bold tabular-nums group-data-[collapsible=icon]:hidden">
									{formatBadgeCount(badge)}
								</span>
							) : null}
						</>
					)}
				</Link>
			</SidebarMenuButton>
		</SidebarMenuItem>
	);
}
