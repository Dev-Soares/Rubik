import { Trash2Icon } from 'lucide-react';
import { EditRoleDialog } from '@/modules/roles/components/EditRoleDialog';
import { useDeleteRole } from '@/modules/roles/hooks/useDeleteRole';
import { useMyScreens } from '@/modules/roles/hooks/useMyScreens';
import {
	SCREEN_GRANT_LABELS,
	SCREEN_LABELS,
	SCREENS,
	type Role,
} from '@/modules/roles/types/role';
import { toGrantByScreen } from '@/modules/roles/utils';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { ADMIN_ROLE } from '@/shared/utils/roles';

type RoleCardProps = {
	role: Role;
};

export function RoleCard({ role }: RoleCardProps) {
	const { mutate: deleteRole, isPending, variables } = useDeleteRole();
	const { can } = useMyScreens();

	const isDeleting = isPending && variables === role.id;

	/*
	 * Quem é administrador recebe acesso total direto do backend, sem passar pelo
	 * cargo: editar as telas daqui não teria efeito nenhum.
	 */
	const isAdminRole = role.name === ADMIN_ROLE;
	const canWrite = can('admin.roles', 'write') && !isAdminRole;

	const grants = toGrantByScreen(role.screens);
	const granted = SCREENS.filter((screen) => grants[screen] !== 'none');

	return (
		<Card>
			<CardContent className="flex flex-col gap-4">
				<div className="flex items-start justify-between gap-2">
					<div className="flex min-w-0 flex-col gap-0.5">
						<h3 className="text-primary truncate text-base font-bold tracking-tight capitalize">
							{role.name}
						</h3>
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
								{granted.length}
							</span>
							<span className="text-muted-foreground text-sm">de {SCREENS.length} telas</span>
						</span>
					)}

					{canWrite ? (
						<span className="flex shrink-0 gap-1">
							<EditRoleDialog role={role} />

							{/* Cargo de sistema é recusado pelo backend: nem mostra o botão. */}
							{role.isSystem ? null : (
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
							)}
						</span>
					) : null}
				</div>

				{isAdminRole ? (
					<p className="text-muted-foreground text-sm">
						Administradores leem e editam todas as telas, inclusive as criadas depois. Este cargo
						não é editável.
					</p>
				) : granted.length === 0 ? (
					<p className="text-muted-foreground text-sm">
						Este cargo ainda não vê nenhuma tela.
						{canWrite ? ' Edite para liberar acesso.' : ''}
					</p>
				) : (
					<div className="flex flex-wrap gap-1">
						{granted.map((screen) => (
							<Badge key={screen} variant="secondary">
								{SCREEN_LABELS[screen]} · {SCREEN_GRANT_LABELS[grants[screen]].toLowerCase()}
							</Badge>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
