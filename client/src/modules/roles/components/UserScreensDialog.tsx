import { Suspense } from 'react';
import { UserScreensPanel } from '@/modules/roles/components/UserScreensPanel';
import { UserScreensSkeleton } from '@/modules/roles/skeletons/UserScreensSkeleton';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/shared/components/ui/dialog';

type UserScreensDialogProps = {
	userId: string;
	userName: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export function UserScreensDialog({
	userId,
	userName,
	open,
	onOpenChange,
}: UserScreensDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="gap-6 p-6 shadow-2xl sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="text-primary text-lg font-black tracking-tight">
						Permissões personalizadas
					</DialogTitle>
					<DialogDescription>Estas escolhas valem acima do cargo de {userName}.</DialogDescription>
				</DialogHeader>

				{/* Só busca ao abrir: a tabela de usuários não espera por isso. */}
				{open ? (
					<Suspense fallback={<UserScreensSkeleton />}>
						<UserScreensPanel userId={userId} onDone={() => onOpenChange(false)} />
					</Suspense>
				) : null}
			</DialogContent>
		</Dialog>
	);
}
