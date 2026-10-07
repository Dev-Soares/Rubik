import { Link, useRouter } from '@tanstack/react-router';
import { TriangleAlertIcon } from 'lucide-react';
import { getErrorMessage, getRequestId } from '@/api/axios';
import { StatusPage } from '@/shared/components/StatusPage';
import { Button } from '@/shared/components/ui/button';

type ErrorPageProps = {
	/** O router entrega `unknown` — pode ser qualquer throw, não só Error. */
	error: unknown;
	reset?: () => void;
	/**
	 * `false` quando a tela já está dentro da casca autenticada. Ver `StatusPage`.
	 */
	fillViewport?: boolean;
};

export function ErrorPage({ error, reset, fillViewport = true }: ErrorPageProps) {
	const router = useRouter();
	const requestId = getRequestId(error);

	/**
	 * Em dev, a mensagem técnica. Em produção, o id de correlação: não expõe
	 * interno e ainda assim dá ao suporte como achar o erro no log.
	 */
	const detail = import.meta.env.DEV
		? getErrorMessage(error)
		: requestId && `Código do erro: ${requestId}`;

	return (
		<StatusPage
			fillViewport={fillViewport}
			icon={TriangleAlertIcon}
			title="Algo deu errado"
			description="Não foi possível carregar esta página. Tente novamente em instantes."
			detail={detail || undefined}
		>
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
		</StatusPage>
	);
}
