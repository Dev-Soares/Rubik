import { LifeBuoyIcon } from 'lucide-react';
import { CreateTicketDialog } from '@/modules/tickets/components/CreateTicketDialog';

/**
 * Chamada de abertura da tela. É o único gatilho do diálogo: com um botão
 * também no cabeçalho, a mesma ação apareceria duas vezes na primeira dobra e
 * nenhuma das duas leria como a principal.
 *
 * Sem card: o fundo do card empurrava a chamada para o mesmo peso visual dos
 * chamados listados logo abaixo, que usam o mesmo container.
 */
export function TicketCallout() {
	return (
		<section className="flex flex-col items-center gap-6 py-6 text-center sm:py-10">
			<LifeBuoyIcon className="text-primary size-12 sm:size-14" aria-hidden />

			<div className="flex flex-col gap-3">
				<h2 className="text-3xl font-black tracking-tight text-balance sm:text-4xl">
					Precisa de ajuda?
				</h2>
				<p className="text-muted-foreground max-w-xl text-base leading-relaxed text-pretty sm:text-lg">
					Conte o que aconteceu e anexe uma foto, se tiver. A equipe recebe seu chamado e entra em
					contato para resolver.
				</p>
			</div>

			<CreateTicketDialog />
		</section>
	);
}
