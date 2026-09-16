import { useAuth } from '@/shared/hooks/useAuth';
import { AppLayout } from '@/shared/layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';

export function Dashboard() {
	const { user } = useAuth();

	return (
		<AppLayout>
			<div className="flex flex-col gap-4">
				<h1 className="text-2xl font-semibold">Olá, {user?.name}.</h1>

				<Card>
					<CardHeader>
						<CardTitle>Ponto de partida</CardTitle>
					</CardHeader>
					<CardContent className="text-muted-foreground text-sm">
						Crie novas rotas em <code className="bg-muted rounded px-1 py-0.5">src/routes/</code> e
						módulos em <code className="bg-muted rounded px-1 py-0.5">src/modules/</code>. Componentes
						do shadcn ficam em{' '}
						<code className="bg-muted rounded px-1 py-0.5">src/shared/components/ui/</code>.
					</CardContent>
				</Card>
			</div>
		</AppLayout>
	);
}
