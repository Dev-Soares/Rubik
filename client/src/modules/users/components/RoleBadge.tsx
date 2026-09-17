import { Badge } from '@/shared/components/ui/badge';
import { isAdminRole } from '@/shared/utils/roles';

type RoleBadgeProps = {
	role: string | null;
};

export function RoleBadge({ role }: RoleBadgeProps) {
	const label = role?.trim() ? role : 'user';

	return <Badge variant={isAdminRole(label) ? 'default' : 'secondary'}>{label}</Badge>;
}
