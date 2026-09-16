import { Badge } from '@/shared/components/ui/badge';

type RoleBadgeProps = {
	role: string | null;
};

export function RoleBadge({ role }: RoleBadgeProps) {
	const label = role?.trim() ? role : 'user';
	const isAdmin = label.split(',').includes('admin');

	return <Badge variant={isAdmin ? 'default' : 'secondary'}>{label}</Badge>;
}
