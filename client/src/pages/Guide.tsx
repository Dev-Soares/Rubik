import { BookOpenIcon } from 'lucide-react';
import { GuidePanel } from '@/modules/guide/components/GuidePanel';
import { PageHeader } from '@/shared/components/PageHeader';
import { Separator } from '@/shared/components/ui/separator';
import { AppLayout } from '@/shared/layouts/AppLayout';

export function Guide() {
	/*
	 * Guia é de duas colunas: alinha à esquerda em vez de centralizar, senão
	 * sobra um vão à esquerda do índice em tela larga.
	 */
	return (
		<AppLayout className="mr-auto ml-0 max-w-6xl">
			<div className="flex flex-col gap-8">
				<div className="flex gap-3">
					<BookOpenIcon className="text-primary mt-1.5 size-8 shrink-0" />

					<PageHeader
						title="Como usar o sistema"
						description="Passo a passo de cada aba, com o que ela faz e o que você precisa para usá-la."
					/>
				</div>

				<Separator />

				<GuidePanel />
			</div>
		</AppLayout>
	);
}
