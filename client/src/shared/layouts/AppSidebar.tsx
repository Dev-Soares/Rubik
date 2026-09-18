import { useMyScreens } from '@/modules/roles/hooks/useMyScreens';
import { UserMenu } from '@/modules/users/components/UserMenu';
import { AppVersion } from '@/shared/components/AppVersion';
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarHeader,
	SidebarMenu,
	SidebarRail,
	useSidebar,
} from '@/shared/components/ui/sidebar';
import { useUnseenResolved } from '@/modules/tickets/hooks/useUnseenResolved';
import { NavGroupItem } from '@/shared/layouts/NavGroupItem';
import { NavLinkItem } from '@/shared/layouts/NavLinkItem';
import { SidebarToggle } from '@/shared/layouts/SidebarToggle';
import { NAV_FOOTER_ITEMS, NAV_ITEMS } from '@/shared/navigation';

export function AppSidebar() {
	const { can } = useMyScreens();
	const { isMobile, setOpenMobile } = useSidebar();
	const { data: unseen } = useUnseenResolved();

	const unseenResolved = unseen?.count ?? 0;

	/*
	 * Um item com filhos só aparece se sobrar ao menos um filho liberado. Quem
	 * manda é a permissão, não o cargo: um cargo qualquer com a tela liberada vê
	 * o grupo, e um admin sem telas não veria (o backend dá todas a ele).
	 */
	const items = NAV_ITEMS.flatMap((item) => {
		if (!item.children) {
			return [item];
		}

		const children = item.children.filter((child) => !child.screen || can(child.screen));

		return children.length > 0 ? [{ ...item, children }] : [];
	});

	/** No mobile a sidebar é um drawer: navegar deve fechá-lo. */
	const closeOnMobile = () => {
		if (isMobile) {
			setOpenMobile(false);
		}
	};

	return (
		<Sidebar collapsible="icon">
			<SidebarHeader className="h-15 items-center justify-center">
				<SidebarToggle />
			</SidebarHeader>

			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupContent>
						<SidebarMenu className="gap-1">
							{items.map((item) =>
								item.children ? (
									<NavGroupItem key={item.to} item={item} onNavigate={closeOnMobile} />
								) : (
									<NavLinkItem key={item.to} item={item} onNavigate={closeOnMobile} />
								)
							)}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>

			<SidebarFooter className="border-t px-2 pt-2 pb-6 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:pb-4">
				{/* Apoio (ex: "Como usar") fica fixo no fim, separado das abas de trabalho. */}
				<SidebarMenu className="gap-1 pb-2">
					{NAV_FOOTER_ITEMS.map((item) => (
						<NavLinkItem
							key={item.to}
							item={item}
							// O aviso é dos chamados resolvidos do próprio usuário; os
							// demais itens do rodapé não têm novidade a sinalizar.
							badge={item.to === '/tickets' ? unseenResolved : 0}
							onNavigate={closeOnMobile}
						/>
					))}
				</SidebarMenu>

				<UserMenu />
				<AppVersion />
			</SidebarFooter>

			<SidebarRail />
		</Sidebar>
	);
}
