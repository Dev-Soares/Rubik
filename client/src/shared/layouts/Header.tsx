import { Link } from '@tanstack/react-router';
import { LogOutIcon, ShieldIcon, UserIcon } from 'lucide-react';
import { useSignOut } from '@/modules/auth/hooks/useSignOut';
import { UserAvatar } from '@/modules/users/components/UserAvatar';
import { AppLogo } from '@/shared/components/AppLogo';
import { ToggleTheme } from '@/shared/components/ToggleTheme';
import { Button } from '@/shared/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { useAuth } from '@/shared/hooks/useAuth';

const linkClass = 'text-muted-foreground hover:text-foreground text-sm transition-colors';
const activeLinkClass = 'text-foreground font-medium';

export function Header() {
	const { user, isAdmin } = useAuth();
	const { mutate: signOut, isPending } = useSignOut();

	return (
		<header className="bg-background sticky top-0 z-10 border-b">
			<div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
				<nav className="flex items-center gap-4">
					<Link to="/dashboard" className="flex items-center gap-2 font-semibold">
						<AppLogo className="size-5" />
						Rubik
					</Link>
					<Link to="/dashboard" className={linkClass} activeProps={{ className: activeLinkClass }}>
						Início
					</Link>
					{isAdmin ? (
						<Link to="/admin" className={linkClass} activeProps={{ className: activeLinkClass }}>
							Admin
						</Link>
					) : null}
				</nav>

				<div className="flex items-center gap-2">
					<ToggleTheme />

					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" size="icon" aria-label="Menu do usuário">
								<UserAvatar name={user?.name ?? '?'} image={user?.image} className="size-8" />
							</Button>
						</DropdownMenuTrigger>

						<DropdownMenuContent align="end" className="w-52">
							<DropdownMenuLabel>
								<span className="block font-medium">{user?.name}</span>
								<span className="text-muted-foreground block text-xs font-normal">
									{user?.email}
								</span>
							</DropdownMenuLabel>

							<DropdownMenuSeparator />

							<DropdownMenuItem asChild>
								<Link to="/profile">
									<UserIcon />
									Perfil
								</Link>
							</DropdownMenuItem>

							{isAdmin ? (
								<DropdownMenuItem asChild>
									<Link to="/admin">
										<ShieldIcon />
										Administração
									</Link>
								</DropdownMenuItem>
							) : null}

							<DropdownMenuSeparator />

							<DropdownMenuItem disabled={isPending} onSelect={() => signOut()} variant="destructive">
								<LogOutIcon />
								Sair
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>
		</header>
	);
}
