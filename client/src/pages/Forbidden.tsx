import { Link } from '@tanstack/react-router';
import { ShieldAlertIcon } from 'lucide-react';
import { StatusPage } from '@/shared/components/StatusPage';
import { Button } from '@/shared/components/ui/button';

export function Forbidden() {
	return (
		<StatusPage
			code="403"
			icon={ShieldAlertIcon}
			title="Acesso negado"
			description="Sua conta não tem permissão para ver esta página. Fale com um administrador se precisar de acesso."
		>
			<Button asChild>
				<Link to="/profile">Ir para o início</Link>
			</Button>
		</StatusPage>
	);
}
