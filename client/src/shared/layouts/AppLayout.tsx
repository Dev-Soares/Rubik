import { Link } from '@tanstack/react-router';
import { cn } from 'cn';
import type { ReactNode } from 'react';
import { AppLogo } from '@/shared/components/AppLogo';
import { ToggleTheme } from '@/shared/components/ToggleTheme';
import { SidebarInset, SidebarProvider } from '@/shared/components/ui/sidebar';
import { AppSidebar } from '@/shared/layouts/AppSidebar';
import { SidebarToggle } from '@/shared/layouts/SidebarToggle';

type AppLayoutProps = {
	children: ReactNode;
	/** Sobrescreve a largura de leitura padrão. Só para telas de duas colunas. */
	className?: string;
};

export function AppLayout({ children, className }: AppLayoutProps) {
	return (
		<SidebarProvider>
			<AppSidebar />

			<SidebarInset>
				<nav className="bg-background sticky top-0 z-30 flex h-15 shrink-0 items-center border-b px-4">
					{/* No mobile a sidebar é drawer: o header traz o botão de abrir. */}
					<SidebarToggle className="md:hidden" />

					<Link to="/profile" className="hidden items-center gap-2 md:flex">
						<AppLogo className="size-6" />
						<span className="text-base font-bold tracking-tight">Rubik</span>
					</Link>

					<div className="ml-auto">
						<ToggleTheme />
					</div>
				</nav>

				{/*
				 * Largura máxima de leitura: com `4xl` as seções de formulário
				 * sobravam metade da tela vazia à direita.
				 */}
				<main className={cn('mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6', className)}>
					{children}
				</main>
			</SidebarInset>
		</SidebarProvider>
	);
}
