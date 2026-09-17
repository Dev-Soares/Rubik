import { SetUserPasswordForm } from '@/modules/users/components/SetUserPasswordForm';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/shared/components/ui/dialog';

type SetUserPasswordDialogProps = {
	userId: string;
	userName: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export function SetUserPasswordDialog({
	userId,
	userName,
	open,
	onOpenChange,
}: SetUserPasswordDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="gap-6 p-6 shadow-2xl sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="text-primary text-lg font-black tracking-tight">
						Alterar senha
					</DialogTitle>
					<DialogDescription>
						Defina uma nova senha para {userName}. As outras sessões dessa pessoa continuam
						abertas.
					</DialogDescription>
				</DialogHeader>

				{/* Desmontar ao fechar limpa os campos: senha digitada não deve sobreviver. */}
				{open ? (
					<SetUserPasswordForm userId={userId} onDone={() => onOpenChange(false)} />
				) : null}
			</DialogContent>
		</Dialog>
	);
}
