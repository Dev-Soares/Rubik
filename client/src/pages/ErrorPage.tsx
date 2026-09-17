import { Link, useRouter } from '@tanstack/react-router';
import { TriangleAlertIcon } from 'lucide-react';
import { getErrorMessage } from '@/api/axios';
import { StatusPage } from '@/shared/components/StatusPage';
import { Button } from '@/shared/components/ui/button';

type ErrorPageProps = {
	/** O router entrega `unknown` — pode ser qualquer throw, não só Error. */
	error: unknown;
	reset?: () => void;
};

export function ErrorPage({ error, reset }: ErrorPageProps) {
	const router = useRouter();

	return (
		<StatusPage
			icon={TriangleAlertIcon}
			title="Algo deu errado"
			description="Não foi possível carregar esta página. Tente novamente em instantes."
			// Detalhe técnico só em desenvolvimento: em produção não expõe interno.
			detail={import.meta.env.DEV ? getErrorMessage(error) : undefined}
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
