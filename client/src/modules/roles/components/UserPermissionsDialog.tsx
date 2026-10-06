import { ShieldIcon } from 'lucide-react';
import { Suspense } from 'react';
import { UserPermissionsPanel } from '@/modules/roles/components/UserPermissionsPanel';
import { UserPermissionsSkeleton } from '@/modules/roles/skeletons/UserPermissionsSkeleton';
import {
	Dialog,
	DialogBody,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/shared/components/ui/dialog';

type UserPermissionsDialogProps = {
	userId: string;
	userName: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export function UserPermissionsDialog({
	userId,
	userName,
	open,
	onOpenChange,
}: UserPermissionsDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="shadow-2xl sm:max-w-md">
				<DialogHeader icon={ShieldIcon}>
					<DialogTitle className="text-primary text-lg font-black tracking-tight">
						Permissões personalizadas
					</DialogTitle>
					<DialogDescription>Estas escolhas valem acima do cargo de {userName}.</DialogDescription>
				</DialogHeader>

				{/* Só busca ao abrir: a tabela de usuários não espera por isso. */}
				{open ? (
					// O `DialogBody` é só do skeleton: o formulário traz o próprio
					// padding, porque o rodapé dele precisa encostar na borda do modal.
					<Suspense
						fallback={
							<DialogBody>
								<UserPermissionsSkeleton />
							</DialogBody>
						}
					>
						<UserPermissionsPanel userId={userId} onDone={() => onOpenChange(false)} />
					</Suspense>
				) : null}
			</DialogContent>
		</Dialog>
	);
}
