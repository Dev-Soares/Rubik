import { Badge } from '@/shared/components/ui/badge';
import { ADMIN_ROLE, toRoleNames } from '@/shared/utils/roles';

type RoleBadgeProps = {
	role: string | null;
};

/** `user.role` é CSV: um badge por cargo, para a soma ficar visível na tabela. */
export function RoleBadge({ role }: RoleBadgeProps) {
	const names = toRoleNames(role);
	const labels = names.length > 0 ? names : ['user'];

	return (
		<span className="flex flex-wrap gap-1">
			{labels.map((name) => (
				<Badge key={name} variant={name === ADMIN_ROLE ? 'default' : 'secondary'}>
					{name}
				</Badge>
			))}
		</span>
	);
}
