import { ProfileForm } from '@/modules/users/components/ProfileForm';
import { RoleBadge } from '@/modules/users/components/RoleBadge';
import { UserAvatar } from '@/modules/users/components/UserAvatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { useAuth } from '@/shared/hooks/useAuth';
import { AppLayout } from '@/shared/layouts/AppLayout';

export function Profile() {
	const { user } = useAuth();

	if (!user) {
		return null;
	}

	return (
		<AppLayout>
			<div className="flex flex-col gap-6">
				<header className="flex items-center gap-4">
					<UserAvatar name={user.name} image={user.image} className="size-16" />
					<div className="flex flex-col items-start gap-1">
						<h1 className="text-2xl font-semibold">{user.name}</h1>
						<span className="text-muted-foreground text-sm">{user.email}</span>
						<RoleBadge role={user.role ?? null} />
					</div>
				</header>

				<Card>
					<CardHeader>
						<CardTitle>Editar perfil</CardTitle>
					</CardHeader>
					<CardContent>
						<ProfileForm
							userId={user.id}
							defaultValues={{ name: user.name, image: user.image ?? '' }}
						/>
					</CardContent>
				</Card>
			</div>
		</AppLayout>
	);
}
