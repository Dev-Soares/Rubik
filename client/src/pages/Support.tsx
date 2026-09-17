import { HeadsetIcon } from 'lucide-react';
import { PageHeader } from '@/shared/components/PageHeader';
import { Card, CardContent } from '@/shared/components/ui/card';
import { AppLayout } from '@/shared/layouts/AppLayout';

export function Support() {
	return (
		<AppLayout>
			<div className="flex flex-col gap-8">
				<div className="flex gap-3">
					<HeadsetIcon className="text-primary mt-1.5 size-8 shrink-0" />

					<PageHeader
						title="Suporte ao vivo"
						description="Fale com a equipe de suporte sem sair do sistema."
					/>
				</div>

				<Card>
					<CardContent className="flex flex-col items-center gap-2 py-12 text-center">
						<h2 className="text-lg font-bold tracking-tight">Em breve</h2>
						<p className="text-muted-foreground max-w-md text-sm text-pretty">
							O atendimento por aqui ainda está sendo preparado. Enquanto isso, procure a equipe
							pelos canais de sempre.
						</p>
					</CardContent>
				</Card>
			</div>
		</AppLayout>
	);
}
