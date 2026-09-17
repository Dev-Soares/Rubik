import type { ReactNode } from 'react';

type FormSectionProps = {
	title: string;
	description?: string;
	children: ReactNode;
};

/**
 * Bloco padrão de formulário: título e descrição sempre acima dos campos.
 *
 * Use sempre este componente nas páginas de ajuste para que todas as seções
 * tenham o mesmo alinhamento e ritmo.
 */
export function FormSection({ title, description, children }: FormSectionProps) {
	return (
		<section className="flex flex-col gap-5">
			<div className="flex flex-col gap-1">
				<h3 className="text-primary text-lg font-black tracking-tight">{title}</h3>
				{description ? (
					<p className="text-muted-foreground text-sm text-pretty">{description}</p>
				) : null}
			</div>

			{children}
		</section>
	);
}
