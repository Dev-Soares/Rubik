import type { ReactNode } from 'react';
import { RubikCube } from '@/shared/components/RubikCube';
import { ToggleTheme } from '@/shared/components/ToggleTheme';

type AuthLayoutProps = {
	title: string;
	children: ReactNode;
};

export function AuthLayout({ title, children }: AuthLayoutProps) {
	/*
	 * Mobile: marca sobre o vermelho e folha clara subindo do rodapé.
	 * Desktop: painel claro à esquerda, card vermelho pendurado na direita.
	 *
	 * É a mesma geometria girada — no desktop o vermelho ocupa a borda esquerda
	 * e o card se pendura na direita; no celular o vermelho ocupa o topo e a
	 * folha se pendura no rodapé. O cubo aparece nos dois: é a marca, e
	 * substituí-lo por um ícone no celular deixava a tela sem identidade.
	 */
	return (
		<div className="bg-primary lg:bg-background relative flex min-h-dvh flex-col lg:grid lg:grid-cols-2 lg:items-center">
			<div className="absolute top-4 right-4 z-10 lg:top-6 lg:right-auto lg:left-6">
				<ToggleTheme className="border-primary-foreground/25 text-primary-foreground hover:text-primary-foreground lg:border-border lg:text-foreground lg:hover:bg-accent lg:hover:text-foreground size-11 bg-transparent hover:bg-white/10 lg:size-9" />
			</div>

			{/*
			 * A marca: `aside` no desktop, cabeçalho da tela no celular.
			 *
			 * No celular a faixa tem altura fixa e a folha fica com o resto da
			 * tela: quem o usuário veio usar é o formulário, e o vermelho é a
			 * assinatura, não o conteúdo. `max-h` segura a proporção numa tela
			 * alta, onde a faixa cresceria sozinha e empurraria o formulário para
			 * o rodapé.
			 */}
			<aside className="text-primary-foreground lg:text-primary flex min-h-0 shrink-0 flex-col items-center justify-center gap-3 px-6 pt-12 pb-8 lg:shrink lg:flex-1 lg:gap-8 lg:p-12">
				{/* viewBox folgado para a animação: largura maior mantém o cubo no mesmo tamanho visual. */}
				<RubikCube className="w-28 lg:w-100" />

				<div className="lg:text-foreground flex flex-col items-center gap-1 lg:gap-3">
					<span className="text-3xl font-bold tracking-tight lg:text-5xl">Rubik</span>
					<span className="text-primary-foreground/70 lg:text-muted-foreground text-sm font-medium tracking-tight lg:text-xl">
						Seu template fullstack
					</span>
				</div>
			</aside>

			{/*
			 * Mobile: folha clara subindo do rodapé, arredondada só no topo.
			 * Desktop: card vermelho pendurado na borda direita.
			 *
			 * `pb` soma a safe area do iOS ao respiro: sem isso o botão "Entrar"
			 * fica debaixo da barra de gestos do iPhone.
			 */}
			<main className="bg-card text-card-foreground lg:bg-primary lg:text-primary-foreground lg:col-start-2 flex flex-1 flex-col gap-6 rounded-t-3xl px-6 pt-10 pb-[max(2.5rem,env(safe-area-inset-bottom)+1.5rem)] shadow-[0_-8px_32px_-12px_rgb(0_0_0/0.35)] sm:px-8 lg:min-h-[88dvh] lg:flex-none lg:justify-center lg:gap-7 lg:rounded-l-3xl lg:rounded-t-none lg:px-0 lg:py-24 lg:pr-16 lg:pl-14 lg:shadow-2xl lg:shadow-black/20">
				{/* `on-primary` adapta o form ao fundo vermelho (só no desktop; ver global.css). */}
				<div className="on-primary mx-auto flex w-full max-w-sm flex-col gap-7 lg:gap-6">
					<h1 className="text-3xl font-bold tracking-tight lg:text-2xl">{title}</h1>
					{children}
				</div>
			</main>
		</div>
	);
}
