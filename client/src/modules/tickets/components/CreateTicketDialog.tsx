import { SendIcon } from 'lucide-react';
import { useState } from 'react';
import { CreateTicketForm } from '@/modules/tickets/components/CreateTicketForm';
import { Button } from '@/shared/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/shared/components/ui/dialog';

export function CreateTicketDialog() {
	const [open, setOpen] = useState(false);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button size="lg" className="h-12 px-7 text-base [&_svg]:size-5">
					<SendIcon />
					Nos envie seu problema
				</Button>
			</DialogTrigger>

			<DialogContent className="gap-6 p-6 shadow-2xl sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="text-primary text-lg font-black tracking-tight">
						Abrir chamado
					</DialogTitle>
					<DialogDescription className="sr-only">
						Informe o título e, se quiser, anexe fotos.
					</DialogDescription>
				</DialogHeader>

				<CreateTicketForm onCreated={() => setOpen(false)} />
			</DialogContent>
		</Dialog>
	);
}
