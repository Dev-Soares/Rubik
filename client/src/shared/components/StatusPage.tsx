import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/utils';

type StatusPageProps = {
	/** Código ou rótulo curto exibido acima do título (ex: "404"). */
	code?: string;
	icon?: LucideIcon;
	title: string;
	description: string;
	/** Detalhe técnico, exibido só em desenvolvimento. */
	detail?: string;
	/**
	 * `false` quando a tela já está dentro da casca autenticada (`AppLayout`),
	 * que traz o cabeçalho acima. `min-h-dvh` ali somaria a altura do cabeçalho
	 * à da viewport e criaria rolagem vertical na página.
	 */
	fillViewport?: boolean;
	children?: ReactNode;
};

/** Tela centralizada para erros e estados terminais (404, 403, falha). */
export function StatusPage({
	code,
	icon: Icon,
	title,
	description,
	detail,
	fillViewport = true,
	children,
}: StatusPageProps) {
	return (
		<div
			className={cn(
				'bg-muted/40 flex items-center justify-center p-6',
				fillViewport ? 'min-h-dvh' : 'min-h-full flex-1',
			)}
		>
			<div className="bg-card flex w-full max-w-md flex-col items-center gap-6 rounded-2xl p-8 text-center ring-1 ring-foreground/10">
				{Icon ? (
					<span className="bg-muted text-muted-foreground flex size-14 items-center justify-center rounded-2xl">
						<Icon className="size-6" />
					</span>
				) : null}

				<div className="flex flex-col items-center gap-2">
					{code ? <span className="text-muted-foreground font-mono text-sm">{code}</span> : null}
					<h1 className="text-2xl font-black tracking-tight">{title}</h1>
					<p className="text-muted-foreground text-sm text-pretty">{description}</p>
				</div>

				{children ? <div className="flex flex-wrap justify-center gap-3">{children}</div> : null}

				{detail ? (
					<pre className="bg-muted text-muted-foreground w-full overflow-x-auto rounded-lg p-3 text-left font-mono text-xs">
						{detail}
					</pre>
				) : null}
			</div>
		</div>
	);
}
