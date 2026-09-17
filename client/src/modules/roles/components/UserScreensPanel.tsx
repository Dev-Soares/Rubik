import { UserScreensForm } from '@/modules/roles/components/UserScreensForm';
import { useUserScreens } from '@/modules/roles/hooks/useUserScreens';

type UserScreensPanelProps = {
	userId: string;
	onDone?: () => void;
};

/** Liga o hook de permissões ao formulário. */
export function UserScreensPanel({ userId, onDone }: UserScreensPanelProps) {
	const { data } = useUserScreens(userId);

	return <UserScreensForm userId={userId} screens={data} onDone={onDone} />;
}
