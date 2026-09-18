import { PlusIcon } from 'lucide-react';
import { useState } from 'react';
import { RoleForm } from '@/modules/roles/components/RoleForm';
import { Button } from '@/shared/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/shared/components/ui/dialog';

export function CreateRoleDialog() {
	const [open, setOpen] = useState(false);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button>
					<PlusIcon />
					Novo cargo
				</Button>
			</DialogTrigger>

			<DialogContent className="gap-6 p-6 shadow-2xl sm:max-w-lg">
				<DialogHeader>
					<DialogTitle className="text-primary text-lg font-black tracking-tight">
						Criar cargo
					</DialogTitle>
					<DialogDescription className="sr-only">
						Defina o nome e o acesso do cargo a cada tela.
					</DialogDescription>
				</DialogHeader>

				<RoleForm onDone={() => setOpen(false)} />
			</DialogContent>
		</Dialog>
	);
}
