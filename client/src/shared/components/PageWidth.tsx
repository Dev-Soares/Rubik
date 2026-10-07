import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/utils';

type PageWidthProps = {
	children: ReactNode;
	/** Sobrescreve a largura de leitura padrão. Só para telas de duas colunas. */
	className?: string;
};

/**
 * O `<main>` da página, com a largura de leitura padrão.
 *
 * Mora na página, e não na `AppLayout`, porque a casca é montada uma vez na rota
 * e não remonta junto com o conteúdo — a largura, que muda de tela para tela,
 * precisa vir de quem conhece a tela.
 *
 * Largura máxima `3xl`: com `4xl` as seções de formulário sobravam metade da
 * tela vazia à direita.
 */
export function PageWidth({ children, className }: PageWidthProps) {
	return (
		<main className={cn('mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6', className)}>
			{children}
		</main>
	);
}
