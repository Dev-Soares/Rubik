import { Link, useRouter } from '@tanstack/react-router';
import { FileQuestionIcon } from 'lucide-react';
import { StatusPage } from '@/shared/components/StatusPage';
import { Button } from '@/shared/components/ui/button';

type NotFoundProps = {
	/**
	 * `false` quando a tela já está dentro da casca autenticada. Ver `StatusPage`.
	 */
	fillViewport?: boolean;
	/** O router passa `data` no `notFoundComponent`; aqui não é usado. */
	data?: unknown;
};

export function NotFound({ fillViewport = true }: NotFoundProps) {
	const router = useRouter();

	return (
		<StatusPage
			fillViewport={fillViewport}
			code="404"
			icon={FileQuestionIcon}
			title="Página não encontrada"
			description="O endereço acessado não existe ou foi movido."
		>
			<Button variant="outline" onClick={() => router.history.back()}>
				Voltar
			</Button>
			<Button asChild>
				<Link to="/profile">Ir para o início</Link>
			</Button>
		</StatusPage>
	);
}
