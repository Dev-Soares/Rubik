import { useDeleteUser } from '@/modules/users/hooks/useDeleteUser';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog';
import { buttonVariants } from '@/shared/components/ui/button';
import { cn } from 'cn';

type DeleteUserDialogProps = {
	userId: string;
	userName: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export function DeleteUserDialog({ userId, userName, open, onOpenChange }: DeleteUserDialogProps) {
	const { mutate: deleteUser, isPending } = useDeleteUser();

	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Excluir {userName}?</AlertDialogTitle>
					<AlertDialogDescription>
						O acesso é encerrado na hora e a conta não pode ser recuperada. Para apenas tirar
						permissões, edite o cargo do usuário.
					</AlertDialogDescription>
				</AlertDialogHeader>

				<AlertDialogFooter>
					<AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
					<AlertDialogAction
						className={cn(buttonVariants({ variant: 'destructive' }))}
						disabled={isPending}
						onClick={(event) => {
							// Fechar só depois da resposta manteria o diálogo travado em erro.
							event.preventDefault();
							deleteUser(userId, { onSettled: () => onOpenChange(false) });
						}}
					>
						{isPending ? 'Excluindo...' : 'Excluir'}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
