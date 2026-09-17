import { PlusIcon } from 'lucide-react';
import { useState } from 'react';
import { CreateUserForm } from '@/modules/users/components/CreateUserForm';
import { Button } from '@/shared/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/shared/components/ui/dialog';

export function CreateUserDialog() {
	const [open, setOpen] = useState(false);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button>
					<PlusIcon />
					Novo usuário
				</Button>
			</DialogTrigger>

			<DialogContent className="gap-6 p-6 shadow-2xl sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="text-primary text-lg font-black tracking-tight">Criar usuário</DialogTitle>
					<DialogDescription className="sr-only">
						Preencha os dados da nova conta.
					</DialogDescription>
				</DialogHeader>

				<CreateUserForm onCreated={() => setOpen(false)} />
			</DialogContent>
		</Dialog>
	);
}
