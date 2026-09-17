import type { ReactNode } from 'react';
import { AppLogo } from '@/shared/components/AppLogo';
import { RubikCube } from '@/shared/components/RubikCube';
import { ToggleTheme } from '@/shared/components/ToggleTheme';

type AuthLayoutProps = {
	title: string;
	children: ReactNode;
};

export function AuthLayout({ title, children }: AuthLayoutProps) {
	// Mobile: card neutro flutuando sobre o fundo vermelho; o vermelho aparece
	// só no botão. Desktop: painel claro à esquerda, card vermelho à direita.
	return (
		<div className="bg-primary lg:bg-background relative flex min-h-dvh flex-col justify-center p-5 lg:grid lg:grid-cols-2 lg:items-center lg:p-0">
			<div className="absolute top-5 right-5 z-10 lg:top-6 lg:right-auto lg:left-6">
				<ToggleTheme className="border-primary-foreground/25 bg-transparent text-primary-foreground hover:bg-white/10 hover:text-primary-foreground lg:border-border lg:text-foreground lg:hover:bg-accent lg:hover:text-foreground" />
			</div>

			<aside className="text-primary hidden flex-col items-center justify-center gap-8 p-12 lg:flex">
				{/* viewBox folgado para a animação: largura maior mantém o cubo no mesmo tamanho visual. */}
				<RubikCube className="w-100" />

				<div className="text-foreground flex flex-col items-center gap-3">
					<span className="text-5xl font-bold tracking-tight">Rubik</span>
					<span className="text-muted-foreground text-xl font-medium tracking-tight">
						Seu template fullstack
					</span>
				</div>
			</aside>

			{/*
			 * Mobile: card claro centrado, com respiro nas bordas.
			 * Desktop: card vermelho pendurado na borda direita.
			 */}
			<main className="bg-card text-card-foreground lg:bg-primary lg:text-primary-foreground flex flex-col gap-7 rounded-3xl px-6 py-10 shadow-xl shadow-black/10 sm:px-8 lg:col-start-2 lg:min-h-[88dvh] lg:justify-center lg:rounded-l-3xl lg:rounded-r-none lg:px-0 lg:py-24 lg:pr-16 lg:pl-14 lg:shadow-2xl lg:shadow-black/20">
				<div className="flex flex-col items-center gap-2 lg:hidden">
					<AppLogo className="text-primary size-11" />
					<span className="text-foreground text-xl font-bold tracking-tight">Rubik</span>
					<span className="text-muted-foreground text-sm">Seu template fullstack</span>
				</div>

				{/* `on-primary` adapta o form ao fundo vermelho (só no desktop; ver global.css). */}
				<div className="on-primary mx-auto flex w-full max-w-sm flex-col gap-6">
					<h1 className="text-xl font-bold tracking-tight lg:text-2xl">{title}</h1>
					{children}
				</div>
			</main>
		</div>
	);
}
