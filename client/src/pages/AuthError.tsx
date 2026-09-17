import { Link, useRouter } from '@tanstack/react-router';
import { TriangleAlertIcon } from 'lucide-react';
import { getErrorMessage } from '@/api/axios';
import { Button } from '@/shared/components/ui/button';
import { AppLayout } from '@/shared/layouts/AppLayout';

type AuthErrorProps = {
	error: unknown;
	reset?: () => void;
};

/** Erro dentro de uma rota protegida: mantém a sidebar para o usuário navegar. */
export function AuthError({ error, reset }: AuthErrorProps) {
	const router = useRouter();

	return (
		<AppLayout>
			<div className="bg-card ring-foreground/10 mx-auto flex max-w-md flex-col items-center gap-6 rounded-2xl p-8 text-center ring-1">
				<span className="bg-muted text-muted-foreground flex size-14 items-center justify-center rounded-2xl">
					<TriangleAlertIcon className="size-6" />
				</span>

				<div className="flex flex-col items-center gap-2">
					<h1 className="text-2xl font-black tracking-tight">Algo deu errado</h1>
					<p className="text-muted-foreground text-sm text-pretty">
						Não foi possível carregar esta página. Tente novamente em instantes.
					</p>
				</div>

				<div className="flex flex-wrap justify-center gap-3">
					<Button
						variant="outline"
						onClick={() => {
							reset?.();
							void router.invalidate();
						}}
					>
						Tentar de novo
					</Button>
					<Button asChild>
						<Link to="/profile">Ir para o início</Link>
					</Button>
				</div>

				{import.meta.env.DEV ? (
					<pre className="bg-muted text-muted-foreground w-full overflow-x-auto rounded-lg p-3 text-left font-mono text-xs">
						{getErrorMessage(error)}
					</pre>
				) : null}
			</div>
		</AppLayout>
	);
}
