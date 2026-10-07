import { Link, Outlet } from '@tanstack/react-router';
import { NotificationBell } from '@/modules/notifications/components/NotificationBell';
import { AppLogo } from '@/shared/components/AppLogo';
import { ToggleTheme } from '@/shared/components/ToggleTheme';
import { SidebarInset, SidebarProvider } from '@/shared/components/ui/sidebar';
import { AppSidebar } from '@/shared/layouts/AppSidebar';
import { SidebarToggle } from '@/shared/layouts/SidebarToggle';

/**
 * Casca das rotas autenticadas. Montada UMA vez, na rota `_auth`, com as
 * páginas entrando pelo `Outlet`.
 *
 * Não receba `children` nem monte isto dentro de uma página. O React só preserva
 * estado quando o componente na mesma posição é do mesmo tipo: com cada página
 * renderizando a própria casca, ir de `Home` para `AdminUsers` troca o tipo
 * naquela posição, e o React desmontava a subárvore inteira — `SidebarProvider`
 * junto. O `open` dele é `useState`, então a sidebar recolhida reabria sozinha a
 * cada navegação, o grupo expandido fechava na mão do usuário, e o
 * `refetchInterval` do sino reiniciava antes de completar. Montada aqui, a casca
 * sobrevive à troca de rota.
 *
 * Largura de leitura da página: `PageWidth`, dentro da própria página.
 */
export function AppLayout() {
	return (
		<SidebarProvider>
			<AppSidebar />

			{/*
			 * `min-w-0` é o que impede o inset de transbordar: item de flex tem
			 * `min-width: auto` por padrão e não encolhe abaixo do conteúdo, então
			 * sem isto ele fica mais largo que a tela quando a sidebar ocupa
			 * espaço — e tudo que se mede por ele (como o painel do sino) herda a
			 * largura inflada.
			 */}
			<SidebarInset className="@container min-w-0">
				<nav className="bg-background sticky top-0 z-30 flex h-15 shrink-0 items-center border-b px-4">
					{/* No mobile a sidebar é drawer: o header traz o botão de abrir. */}
					<SidebarToggle className="md:hidden" />

					<Link to="/profile" className="hidden items-center gap-2 md:flex">
						<AppLogo className="size-6" />
						<span className="text-base font-bold tracking-tight">Rubik</span>
					</Link>

					<div className="ml-auto flex items-center gap-1">
						<NotificationBell />
						<ToggleTheme />
					</div>
				</nav>

				<Outlet />
			</SidebarInset>
		</SidebarProvider>
	);
}
