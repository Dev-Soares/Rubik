import { Link } from '@tanstack/react-router';
import { Button } from '@/shared/components/ui/button';

export function NotFound() {
	return (
		<div className="flex min-h-dvh flex-col items-center justify-center gap-4">
			<h1 className="text-2xl font-semibold tracking-tight">Página não encontrada</h1>
			<Button asChild variant="outline">
				<Link to="/">Voltar ao início</Link>
			</Button>
		</div>
	);
}
