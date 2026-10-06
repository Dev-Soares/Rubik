import { Trash2Icon } from 'lucide-react';
import { EditRoleDialog } from '@/modules/roles/components/EditRoleDialog';
import { RoleBadge } from '@/modules/roles/components/RoleBadge';
import { useDeleteRole } from '@/modules/roles/hooks/useDeleteRole';
import { useMyPermissions } from '@/modules/roles/hooks/useMyPermissions';
import {
	ACTION_LABELS,
	MODULE_LABELS,
	MODULES,
	PERMISSIONS,
	type Role,
} from '@/modules/roles/types/role';
import { actionsOf, countGranted, toPermission } from '@/modules/roles/utils';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { ADMIN_ROLE } from '@/shared/utils/roles';

type RoleCardProps = {
	role: Role;
};

export function RoleCard({ role }: RoleCardProps) {
	const { mutate: deleteRole, isPending, variables } = useDeleteRole();
	const { can } = useMyPermissions();

	const isDeleting = isPending && variables === role.id;

	/*
	 * Quem é administrador recebe acesso total direto do backend, sem passar pelo
	 * cargo: editar as permissões daqui não teria efeito nenhum.
	 */
	const isAdminRole = role.name === ADMIN_ROLE;
	const canEdit = can('cargos', 'editar') && !isAdminRole;
	const canDelete = can('cargos', 'apagar') && !isAdminRole;

	const granted = MODULES.filter((module) => countGranted(role.permissions, module) > 0);

	return (
		<Card>
			<CardContent className="flex flex-col gap-4">
				<div className="flex items-start justify-between gap-2">
					<div className="flex min-w-0 flex-col gap-1.5">
						<RoleBadge name={role.name} color={role.color} icon={role.icon} />
						<span className="text-muted-foreground truncate text-sm">
							{role.description ?? 'Sem descrição'}
						</span>
					</div>

					{role.isSystem ? (
						<Badge variant="outline" className="shrink-0">
							sistema
						</Badge>
					) : null}
				</div>

				<div className="flex items-end justify-between gap-2 border-t pt-4">
					{/*
					 * O que o cargo libera é a informação que distingue um card do
					 * outro: ganha o maior peso tipográfico do card.
					 */}
					{isAdminRole ? (
						<span className="text-primary text-lg leading-none font-semibold">Acesso total</span>
					) : (
						<span className="flex items-baseline gap-1.5">
							<span className="text-primary text-2xl leading-none font-semibold tabular-nums">
								{role.permissions.length}
							</span>
							<span className="text-muted-foreground text-sm">
								de {PERMISSIONS.length} permissões
							</span>
						</span>
					)}

					{canEdit || canDelete ? (
						<span className="flex shrink-0 gap-1">
							{canEdit ? <EditRoleDialog role={role} /> : null}

							{/* Cargo de sistema é recusado pelo backend: nem mostra o botão. */}
							{canDelete && !role.isSystem ? (
								<Button
									variant="ghost"
									size="icon"
									className="text-muted-foreground hover:text-destructive"
									aria-label={`Remover ${role.name}`}
									disabled={isDeleting}
									onClick={() => deleteRole(role.id)}
								>
									<Trash2Icon />
								</Button>
							) : null}
						</span>
					) : null}
				</div>

				{isAdminRole ? (
					<p className="text-muted-foreground text-sm">
						Administradores fazem tudo em todos os módulos, inclusive nos criados depois. Este cargo
						não é editável.
					</p>
				) : granted.length === 0 ? (
					<p className="text-muted-foreground text-sm">
						Este cargo ainda não acessa nenhum módulo.
						{canEdit ? ' Edite para liberar acesso.' : ''}
					</p>
				) : (
					<div className="flex flex-col gap-1.5">
						{granted.map((module) => (
							<div key={module} className="flex flex-wrap items-center gap-1.5">
								<span className="text-sm font-medium">{MODULE_LABELS[module]}</span>
								{actionsOf(module)
									.filter((action) => role.permissions.includes(toPermission(module, action)))
									.map((action) => (
										<Badge key={action} variant="secondary" className="text-xs font-normal">
											{ACTION_LABELS[action]}
										</Badge>
									))}
							</div>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
