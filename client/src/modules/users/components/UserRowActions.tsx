import {
	KeyRoundIcon,
	MoreVerticalIcon,
	PencilIcon,
	ShieldIcon,
	Trash2Icon,
	UserCheckIcon,
	UserXIcon,
} from 'lucide-react';
import { useState } from 'react';
import { UserPermissionsDialog } from '@/modules/roles/components/UserPermissionsDialog';
import { DeleteUserDialog } from '@/modules/users/components/DeleteUserDialog';
import { EditUserDialog } from '@/modules/users/components/EditUserDialog';
import { SetUserPasswordDialog } from '@/modules/users/components/SetUserPasswordDialog';
import { ToggleUserActiveDialog } from '@/modules/users/components/ToggleUserActiveDialog';
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
type OpenDialog = 'edit' | 'password' | 'screens' | 'active' | 'delete' | null;

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

	/*
	 * Inativar conta é do mesmo plugin admin, que também exige a role `admin`.
	 * O Better Auth recusa inativar a si mesmo; esconder o item evita o erro.
	 */
	const canToggleActive = isAdmin && !isSelf;
	const isBanned = user.banned === true;

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

					{canToggleActive ? (
						<DropdownMenuItem onSelect={() => setDialog('active')}>
							{isBanned ? <UserCheckIcon /> : <UserXIcon />}
							{isBanned ? 'Reativar' : 'Inativar'}
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
				<UserPermissionsDialog
					userId={user.id}
					userName={user.name}
					open={dialog === 'screens'}
					onOpenChange={close}
				/>
			) : null}

			{canToggleActive ? (
				<ToggleUserActiveDialog
					userId={user.id}
					userName={user.name}
					isBanned={isBanned}
					open={dialog === 'active'}
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
