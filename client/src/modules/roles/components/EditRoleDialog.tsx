import { cn } from 'cn';
import { PencilIcon } from 'lucide-react';
import { useState } from 'react';
import { RoleForm } from '@/modules/roles/components/RoleForm';
import type { Role } from '@/modules/roles/types/role';
import { Button } from '@/shared/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/shared/components/ui/dialog';

type EditRoleDialogProps = {
	role: Role;
	className?: string;
};

export function EditRoleDialog({ role, className }: EditRoleDialogProps) {
	const [open, setOpen] = useState(false);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					className={cn('text-muted-foreground hover:text-foreground', className)}
					aria-label={`Editar ${role.name}`}
				>
					<PencilIcon />
				</Button>
			</DialogTrigger>

			<DialogContent className="gap-6 p-6 shadow-2xl sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="text-primary text-lg font-black tracking-tight">
						Editar cargo
					</DialogTitle>
					<DialogDescription className="sr-only">
						Altere o nome, a descrição e o acesso do cargo às telas.
					</DialogDescription>
				</DialogHeader>

				{/* `key` remonta o form ao reabrir, senão mantém valores do último open. */}
				<RoleForm key={role.updatedAt} role={role} onDone={() => setOpen(false)} />
			</DialogContent>
		</Dialog>
	);
}
