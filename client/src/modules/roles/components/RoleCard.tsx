import { Trash2Icon } from 'lucide-react';
import { EditRoleDialog } from '@/modules/roles/components/EditRoleDialog';
import { useDeleteRole } from '@/modules/roles/hooks/useDeleteRole';
import { SCREEN_LABELS, SCREENS, type Role } from '@/modules/roles/types/role';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';

type RoleCardProps = {
	role: Role;
};

export function RoleCard({ role }: RoleCardProps) {
	const { mutate: deleteRole, isPending, variables } = useDeleteRole();

	const isDeleting = isPending && variables === role.id;

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
					<span className="flex items-baseline gap-1.5">
						<span className="text-primary text-2xl leading-none font-semibold tabular-nums">
							{role.screens.length}
						</span>
						<span className="text-muted-foreground text-sm">de {SCREENS.length} telas</span>
					</span>

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
				</div>

				{role.screens.length === 0 ? (
					<p className="text-muted-foreground text-sm">
						Este cargo ainda não vê nenhuma tela. Edite para liberar acesso.
					</p>
				) : (
					<div className="flex flex-wrap gap-1">
						{role.screens.map((screen) => (
							<Badge key={screen} variant="secondary">
								{SCREEN_LABELS[screen]}
							</Badge>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
