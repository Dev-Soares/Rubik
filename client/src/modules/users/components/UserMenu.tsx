import { Link } from '@tanstack/react-router';
import { MoreVerticalIcon } from 'lucide-react';
import { UserAvatar } from '@/modules/users/components/UserAvatar';
import { SidebarMenuButton } from '@/shared/components/ui/sidebar';
import { useAuth } from '@/shared/hooks/useAuth';

/** Atalho para o perfil, fixo no rodapé da sidebar. */
export function UserMenu() {
	const { user } = useAuth();

	return (
		<SidebarMenuButton
			asChild
			size="lg"
			tooltip={user?.name ?? 'Perfil'}
			className="text-foreground hover:bg-foreground/5 h-auto gap-3 py-2.5 group-data-[collapsible=icon]:size-auto! group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:bg-transparent! group-data-[collapsible=icon]:p-0!"
		>
			<Link
				to="/profile"
				activeProps={{ className: 'bg-foreground/5 group-data-[collapsible=icon]:bg-transparent' }}
			>
				<UserAvatar
					name={user?.name ?? '?'}
					image={user?.image}
					className="size-9 shrink-0 transition-opacity group-data-[collapsible=icon]:hover:opacity-80"
				/>

				<span className="flex min-w-0 flex-1 flex-col text-left leading-tight group-data-[collapsible=icon]:hidden">
					<span className="text-foreground truncate text-sm font-semibold">{user?.name}</span>
					<span className="text-muted-foreground truncate text-xs">{user?.email}</span>
				</span>

				{/* Só afordância: sinaliza que o card leva a algum lugar. */}
				<MoreVerticalIcon
					aria-hidden
					className="text-muted-foreground shrink-0 group-data-[collapsible=icon]:hidden"
				/>
			</Link>
		</SidebarMenuButton>
	);
}
