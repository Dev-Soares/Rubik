import { RoleCard } from '@/modules/roles/components/RoleCard';
import type { Role } from '@/modules/roles/types/role';

type RolesGridProps = {
	roles: Role[];
};

export function RolesGrid({ roles }: RolesGridProps) {
	if (roles.length === 0) {
		return <p className="text-muted-foreground py-8 text-center text-sm">Nenhum cargo.</p>;
	}

	return (
		<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
			{roles.map((role) => (
				<RoleCard key={role.id} role={role} />
			))}
		</div>
	);
}
