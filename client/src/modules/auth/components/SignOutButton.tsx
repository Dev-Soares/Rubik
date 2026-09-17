import { LogOutIcon } from 'lucide-react';
import { useSignOut } from '@/modules/auth/hooks/useSignOut';
import { Button } from '@/shared/components/ui/button';

export function SignOutButton() {
	const { mutate: signOut, isPending } = useSignOut();

	return (
		<Button variant="outline" className="w-fit" disabled={isPending} onClick={() => signOut()}>
			<LogOutIcon />
			{isPending ? 'Saindo...' : 'Sair da conta'}
		</Button>
	);
}
