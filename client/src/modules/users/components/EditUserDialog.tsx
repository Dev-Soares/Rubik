import { UserPenIcon } from 'lucide-react';
import { Suspense } from 'react';
import { EditUserForm } from '@/modules/users/components/EditUserForm';
import type { User } from '@/modules/users/types/user';
import { Skeleton } from '@/shared/components/ui/skeleton';
import {
	Dialog,
	DialogBody,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/shared/components/ui/dialog';

type EditUserDialogProps = {
	user: User;
	isSelf: boolean;
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export function EditUserDialog({ user, isSelf, open, onOpenChange }: EditUserDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="shadow-2xl sm:max-w-md">
				<DialogHeader icon={UserPenIcon}>
					<DialogTitle className="text-primary text-lg font-black tracking-tight">
						Editar usuário
					</DialogTitle>
					<DialogDescription>Altere o nome e os cargos de {user.name}.</DialogDescription>
				</DialogHeader>

				{/* Só busca os cargos ao abrir: a tabela não espera por isso. */}
				{open ? (
					<Suspense
						fallback={
							<DialogBody>
								<Skeleton className="h-64 w-full" />
							</DialogBody>
						}
					>
						<EditUserForm user={user} isSelf={isSelf} onDone={() => onOpenChange(false)} />
					</Suspense>
				) : null}
			</DialogContent>
		</Dialog>
	);
}
