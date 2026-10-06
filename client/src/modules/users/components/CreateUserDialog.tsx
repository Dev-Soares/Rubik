import { PlusIcon, UserPlusIcon } from 'lucide-react';
import { Suspense, useState } from 'react';
import { CreateUserForm } from '@/modules/users/components/CreateUserForm';
import { Button } from '@/shared/components/ui/button';
import { Skeleton } from '@/shared/components/ui/skeleton';
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

			<DialogContent className="shadow-2xl sm:max-w-md">
				<DialogHeader icon={UserPlusIcon}>
					<DialogTitle className="text-primary text-lg font-black tracking-tight">
						Criar usuário
					</DialogTitle>
					<DialogDescription className="sr-only">
						Preencha os dados da nova conta.
					</DialogDescription>
				</DialogHeader>

				{/* Só busca os cargos ao abrir: a tabela não espera por isso. */}
				{open ? (
					<Suspense fallback={<Skeleton className="h-96 w-full" />}>
						<CreateUserForm onCreated={() => setOpen(false)} />
					</Suspense>
				) : null}
			</DialogContent>
		</Dialog>
	);
}
