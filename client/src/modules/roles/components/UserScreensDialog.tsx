import { EyeIcon } from 'lucide-react';
import { Suspense, useState } from 'react';
import { UserScreensPanel } from '@/modules/roles/components/UserScreensPanel';
import { UserScreensSkeleton } from '@/modules/roles/skeletons/UserScreensSkeleton';
import { Button } from '@/shared/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/shared/components/ui/dialog';

type UserScreensDialogProps = {
	userId: string;
	userName: string;
};

export function UserScreensDialog({ userId, userName }: UserScreensDialogProps) {
	const [open, setOpen] = useState(false);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					className="text-muted-foreground hover:text-foreground"
					aria-label={`Visualização de ${userName}`}
				>
					<EyeIcon />
				</Button>
			</DialogTrigger>

			<DialogContent className="gap-6 p-6 shadow-2xl sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="text-primary text-lg font-black tracking-tight">
						Visualização personalizada
					</DialogTitle>
					<DialogDescription>
						Estas escolhas valem acima do cargo de {userName}.
					</DialogDescription>
				</DialogHeader>

				{/* Só busca ao abrir: a tabela de usuários não espera por isso. */}
				{open ? (
					<Suspense fallback={<UserScreensSkeleton />}>
						<UserScreensPanel userId={userId} onDone={() => setOpen(false)} />
					</Suspense>
				) : null}
			</DialogContent>
		</Dialog>
	);
}
