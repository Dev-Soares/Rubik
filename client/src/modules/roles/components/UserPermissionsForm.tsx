import { useState } from 'react';
import { useSetUserPermissions } from '@/modules/roles/hooks/useSetUserPermissions';
import { UserPermissionRow } from '@/modules/roles/components/UserPermissionRow';
import { PERMISSION_CATALOG, SECTORS } from '@/modules/roles/types/catalog';
import { type AccessByPermission, type UserPermissions } from '@/modules/roles/types/role';
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
				{/* Mesma tabela do formulário de cargo, agrupada pelos mesmos setores. */}
				<div className="max-h-80 overflow-y-auto">
					<div className="flex flex-col gap-4">
						{SECTORS.map((sector) => (
							<div key={sector} className="overflow-hidden rounded-lg border">
								<div className="bg-muted/40 text-muted-foreground border-b px-3 py-1.5 text-[11px] font-medium">
									{sector}
								</div>

								{PERMISSION_CATALOG.filter((item) => item.sector === sector).map((item) => (
									<UserPermissionRow
										key={item.module}
										item={item}
										access={access}
										inherited={permissions.inherited}
										disabled={isPending}
										onChange={(permission, value) =>
											setAccess((current) => ({ ...current, [permission]: value }))
										}
									/>
								))}
							</div>
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
