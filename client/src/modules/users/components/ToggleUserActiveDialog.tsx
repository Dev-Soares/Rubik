import { useToggleUserActive } from '@/modules/users/hooks/useToggleUserActive';
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
import { cn } from '@/shared/lib/utils';

type ToggleUserActiveDialogProps = {
	userId: string;
	userName: string;
	/** `true` quando a conta já está inativa — o diálogo passa a ser de reativação. */
	isBanned: boolean;
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export function ToggleUserActiveDialog({
	userId,
	userName,
	isBanned,
	open,
	onOpenChange,
}: ToggleUserActiveDialogProps) {
	const { mutate: toggle, isPending } = useToggleUserActive(userId, isBanned);

	const actionLabel = isBanned ? 'Reativar' : 'Inativar';

	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>
						{actionLabel} {userName}?
					</AlertDialogTitle>
					<AlertDialogDescription>
						{isBanned
							? 'A pessoa volta a entrar com a mesma senha e os mesmos cargos de antes.'
							: 'A pessoa é desconectada na hora e não consegue mais entrar, mas a conta e os cargos ficam guardados. Você pode reativá-la a qualquer momento.'}
					</AlertDialogDescription>
				</AlertDialogHeader>

				<AlertDialogFooter>
					<AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
					<AlertDialogAction
						className={cn(buttonVariants({ variant: isBanned ? 'default' : 'destructive' }))}
						disabled={isPending}
						onClick={(event) => {
							// Fechar só depois da resposta manteria o diálogo travado em erro.
							event.preventDefault();
							toggle(undefined, { onSettled: () => onOpenChange(false) });
						}}
					>
						{isPending ? 'Salvando...' : actionLabel}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
