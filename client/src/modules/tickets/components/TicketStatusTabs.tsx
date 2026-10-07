import type { ReactNode } from 'react';
import { TICKET_STATUSES } from '@/modules/tickets/types/ticket';
import type { TicketCounts, TicketStatus } from '@/modules/tickets/types/ticket';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { cn } from '@/shared/lib/utils';

/** Plural do rótulo: a aba fala do conjunto, o selo do card fala de um item. */
const TAB_LABELS: Record<TicketStatus, string> = {
	recebido: 'Recebidos',
	resolvido: 'Resolvidos',
};

type TicketStatusTabsProps = {
	value: TicketStatus;
	counts: TicketCounts;
	onChange: (status: TicketStatus) => void;
	/** A lista do status selecionado. Entra como painel da aba. */
	children: ReactNode;
};

export function TicketStatusTabs({ value, counts, onChange, children }: TicketStatusTabsProps) {
	return (
		/*
		 * Primitivo do Radix, e não botões com `role="tab"` escrito à mão: o papel
		 * `tab` promete navegação por seta, Home e End, com um único ponto de
		 * parada no Tab. A versão manual anunciava o papel e não respondia a
		 * tecla nenhuma — o leitor de tela dizia "aba, 1 de 2" e a seta não fazia
		 * nada. O Radix traz esse contrato pronto.
		 *
		 * `activationMode` fica no padrão (`automatic`): a seta já troca de aba,
		 * que é o esperado quando o conteúdo é só uma lista filtrada.
		 */
		<Tabs value={value} onValueChange={(next) => onChange(next as TicketStatus)} className="gap-0">
			{/* `variant="line"` é a sublinha; o fundo cheio do padrão não combina
			    com a borda inferior que separa a lista. */}
			<TabsList variant="line" className="h-auto w-full justify-start gap-0 border-b p-0">
				{TICKET_STATUSES.map((status) => {
					const selected = status === value;

					return (
						<TabsTrigger
							key={status}
							value={status}
							className={cn(
								// `-mb-px` sobrepõe a borda inferior do contêiner, senão a
								// linha da aba ativa fica flutuando acima dela.
								'-mb-px h-auto flex-1 gap-2 rounded-none border-b-2 border-transparent px-4 py-3 text-sm font-semibold sm:flex-none sm:px-8',
								// A sublinha do primitivo é um `::after`; aqui a borda já faz
								// esse papel, então ela sai de cena.
								'after:hidden data-active:border-primary data-active:text-primary',
							)}
						>
							{TAB_LABELS[status]}

							<span
								className={cn(
									'rounded-full px-2 py-0.5 text-xs font-bold tabular-nums',
									selected ? 'bg-primary text-primary-foreground' : 'bg-muted',
								)}
							>
								{counts[status]}
							</span>
						</TabsTrigger>
					);
				})}
			</TabsList>

			{/*
			 * O painel mora dentro da raiz para o Radix ligar `aria-controls` e
			 * `aria-labelledby` entre aba e conteúdo. Antes o painel ficava fora,
			 * com um `aria-labelledby` escrito à mão apontando para um `id` que
			 * só existia na versão manual das abas.
			 *
			 * Um `TabsContent` só, com o valor atual: a lista é remontada ao trocar
			 * de status (ver `TicketPanel`), então não há conteúdo por aba para
			 * manter vivo em paralelo.
			 */}
			<TabsContent value={value} className="pt-6">
				{children}
			</TabsContent>
		</Tabs>
	);
}
