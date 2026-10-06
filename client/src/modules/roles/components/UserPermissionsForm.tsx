import { useState } from 'react';
import { useSetUserPermissions } from '@/modules/roles/hooks/useSetUserPermissions';
import { UserPermissionAccessCard } from '@/modules/roles/components/UserPermissionAccessCard';
import { MODULES, type AccessByPermission, type UserPermissions } from '@/modules/roles/types/role';
import { toAccessByPermission, toPermissionOverrides } from '@/modules/roles/utils';
import { FormError } from '@/shared/components/FormError';
import { Button } from '@/shared/components/ui/button';
import { DialogClose, DialogFooter } from '@/shared/components/ui/dialog';

type UserPermissionsFormProps = {
	userId: string;
	permissions: UserPermissions;
	onDone?: () => void;
};

export function UserPermissionsForm({ userId, permissions, onDone }: UserPermissionsFormProps) {
	const [access, setAccess] = useState<AccessByPermission>(() => toAccessByPermission(permissions));

	const { mutate, isPending, error } = useSetUserPermissions(userId, onDone);

	const handleSubmit = (event: React.SyntheticEvent) => {
		event.preventDefault();
		mutate(toPermissionOverrides(access, permissions.inherited));
	};

	return (
		<form onSubmit={handleSubmit} className="flex flex-col gap-6">
			<fieldset disabled={isPending} className="contents">
				{/* Mesma grade do formulário de cargo: a lista cresce com o produto. */}
				<div className="max-h-72 overflow-y-auto">
					<div className="flex flex-col gap-2">
						{MODULES.map((module) => (
							<UserPermissionAccessCard
								key={module}
								module={module}
								access={access}
								inherited={permissions.inherited}
								disabled={isPending}
								onChange={(permission, value) =>
									setAccess((current) => ({ ...current, [permission]: value }))
								}
							/>
						))}
					</div>
				</div>

				<FormError message={error?.message} />

				<DialogFooter>
					<DialogClose asChild>
						<Button type="button" variant="ghost">
							Cancelar
						</Button>
					</DialogClose>
					<Button type="submit" disabled={isPending}>
						{isPending ? 'Salvando...' : 'Salvar permissões'}
					</Button>
				</DialogFooter>
			</fieldset>
		</form>
	);
}
