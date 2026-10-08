import { MessageSquareIcon } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import {
	Dialog,
	DialogBody,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/shared/components/ui/dialog';

type TicketResolutionDialogProps = {
	/** Assunto do chamado, para o modal dizer a que a resposta se refere. */
	title: string;
	/** Texto do atendimento. Nulo quando não houve resposta escrita. */
	resolution: string | null;
};

/**
 * "Ver resposta" e o modal com a devolutiva do atendimento.
 *
 * Modal, e não um bloco aberto na linha: a resposta é texto livre de tamanho
 * imprevisível, e exibi-la inline faria cada linha da tabela ter uma altura
 * diferente — a lista deixaria de ser varrível, que é a função dela.
 *
 * Devolve `null` sem texto, em vez de um botão desabilitado: ausência de
 * devolutiva é o caso comum mesmo em chamado resolvido, e um botão morto em
 * quase toda linha prometeria uma resposta que não existe.
 */
export function TicketResolutionDialog({ title, resolution }: TicketResolutionDialogProps) {
	const [open, setOpen] = useState(false);

	if (!resolution) {
		return null;
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				{/* `size="sm"` e `variant="outline"`: a ação é opcional e não compete
				    com o assunto, que é o que se lê primeiro na linha. */}
				<Button size="sm" variant="outline" className="mt-2">
					<MessageSquareIcon />
					Ver resposta
				</Button>
			</DialogTrigger>

			<DialogContent className="shadow-2xl sm:max-w-lg">
				<DialogHeader icon={MessageSquareIcon}>
					<DialogTitle className="text-primary text-lg font-black tracking-tight">
						Resposta do atendimento
					</DialogTitle>
					{/* Não é `sr-only`: o assunto situa a resposta, e quem clicou numa
					    lista de vários chamados precisa saber qual abriu. */}
					<DialogDescription>{title}</DialogDescription>
				</DialogHeader>

				<DialogBody>
					{/* `whitespace-pre-line` preserva a quebra de linha que quem escreveu
					    usou para separar os parágrafos — colapsá-las viraria um bloco
					    único. */}
					<p className="text-sm leading-relaxed whitespace-pre-line">{resolution}</p>
				</DialogBody>
			</DialogContent>
		</Dialog>
	);
}
