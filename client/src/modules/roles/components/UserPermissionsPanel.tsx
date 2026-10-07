import { UserPermissionsForm } from '@/modules/roles/components/UserPermissionsForm';
import { useUserPermissions } from '@/modules/roles/hooks/useUserPermissions';

type UserPermissionsPanelProps = {
	userId: string;
	onDone?: () => void;
};

/** Liga o hook de permissões ao formulário. */
export function UserPermissionsPanel({ userId, onDone }: UserPermissionsPanelProps) {
	const { data } = useUserPermissions(userId);

	return <UserPermissionsForm userId={userId} permissions={data} onDone={onDone} />;
}
