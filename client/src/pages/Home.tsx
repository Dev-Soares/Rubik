import { HomeShortcuts } from '@/modules/home/components/HomeShortcuts';
import { AppLogo } from '@/shared/components/AppLogo';
import { useAuth } from '@/shared/hooks/useAuth';
import { AppLayout } from '@/shared/layouts/AppLayout';

/** Primeiro nome basta para o cumprimento; o nome completo fica no perfil. */
function getFirstName(name: string | undefined): string {
	return name?.trim().split(' ')[0] ?? '';
}

export function Home() {
	const { user } = useAuth();

	const name = getFirstName(user?.name);

	return (
		<AppLayout>
			<div className="flex flex-col gap-8">
				<header className="flex flex-col gap-3">
					<AppLogo className="size-10" />

					<h1 className="text-primary text-3xl font-black tracking-tight text-balance sm:text-4xl">
						{name ? `Bem-vindo ao Rubik, ${name}!` : 'Bem-vindo ao Rubik!'}
					</h1>
					<p className="text-muted-foreground text-base text-pretty">Por onde quer começar?</p>
				</header>

				<HomeShortcuts />
			</div>
		</AppLayout>
	);
}
