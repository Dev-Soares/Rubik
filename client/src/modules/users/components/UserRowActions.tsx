import { KeyRoundIcon, MoreVerticalIcon, PencilIcon, ShieldIcon, Trash2Icon } from 'lucide-react';
import { useState } from 'react';
import { UserScreensDialog } from '@/modules/roles/components/UserScreensDialog';
import { DeleteUserDialog } from '@/modules/users/components/DeleteUserDialog';
import { EditUserDialog } from '@/modules/users/components/EditUserDialog';
import { SetUserPasswordDialog } from '@/modules/users/components/SetUserPasswordDialog';
import type { User } from '@/modules/users/types/user';
import { useAuth } from '@/shared/hooks/useAuth';
import { Button } from '@/shared/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { isAdminRole } from '@/shared/utils/roles';

/** Qual diálogo a linha abriu; `null` é o estado fechado. */
type OpenDialog = 'edit' | 'password' | 'screens' | 'delete' | null;

type UserRowActionsProps = {
	user: User;
	/** `true` quando a linha é a conta de quem está usando o sistema. */
	isSelf: boolean;
};

export function UserRowActions({ user, isSelf }: UserRowActionsProps) {
	const [dialog, setDialog] = useState<OpenDialog>(null);
	const { isAdmin } = useAuth();

	// Admin recebe acesso total do backend: não há exceção para personalizar.
	const canCustomizeScreens = !isAdminRole(user.role);

	/*
	 * Definir senha de outra pessoa é do plugin admin do Better Auth, que exige a
	 * role `admin` — a permissão de tela não vale aqui. Na própria conta o caminho
	 * é o Perfil, que pede a senha atual.
	 */
	const canSetPassword = isAdmin && !isSelf;

	const close = (open: boolean) => {
		if (!open) {
			setDialog(null);
		}
	};

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant="ghost"
						size="icon"
						className="text-muted-foreground hover:text-foreground cursor-pointer"
						aria-label={`Ações de ${user.name}`}
					>
						<MoreVerticalIcon />
					</Button>
				</DropdownMenuTrigger>

				{/* O `!` vence o `cursor-default` que o item do shadcn já traz. */}
				<DropdownMenuContent align="end" className="w-44 *:cursor-pointer!">
					<DropdownMenuItem onSelect={() => setDialog('edit')}>
						<PencilIcon />
						Editar
					</DropdownMenuItem>

					{canSetPassword ? (
						<DropdownMenuItem onSelect={() => setDialog('password')}>
							<KeyRoundIcon />
							Alterar senha
						</DropdownMenuItem>
					) : null}

					{canCustomizeScreens ? (
						<DropdownMenuItem onSelect={() => setDialog('screens')}>
							<ShieldIcon />
							Permissões
						</DropdownMenuItem>
					) : null}

					{/* Excluir a própria conta deixaria a sessão órfã. */}
					{isSelf ? null : (
						<DropdownMenuItem variant="destructive" onSelect={() => setDialog('delete')}>
							<Trash2Icon />
							Excluir
						</DropdownMenuItem>
					)}
				</DropdownMenuContent>
			</DropdownMenu>

			<EditUserDialog user={user} isSelf={isSelf} open={dialog === 'edit'} onOpenChange={close} />

			{canSetPassword ? (
				<SetUserPasswordDialog
					userId={user.id}
					userName={user.name}
					open={dialog === 'password'}
					onOpenChange={close}
				/>
			) : null}

			{canCustomizeScreens ? (
				<UserScreensDialog
					userId={user.id}
					userName={user.name}
					open={dialog === 'screens'}
					onOpenChange={close}
				/>
			) : null}

			<DeleteUserDialog
				userId={user.id}
				userName={user.name}
				open={dialog === 'delete'}
				onOpenChange={close}
			/>
		</>
	);
}
