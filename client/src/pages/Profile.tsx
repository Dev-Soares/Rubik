import { SignOutButton } from '@/modules/auth/components/SignOutButton';
import { ChangePasswordForm } from '@/modules/users/components/ChangePasswordForm';
import { ProfileForm } from '@/modules/users/components/ProfileForm';
import { RoleBadge } from '@/modules/users/components/RoleBadge';
import { UserAvatar } from '@/modules/users/components/UserAvatar';
import { FormSection } from '@/shared/components/FormSection';
import { PageHeader } from '@/shared/components/PageHeader';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Separator } from '@/shared/components/ui/separator';
import { useAuth } from '@/shared/hooks/useAuth';
import { AppLayout } from '@/shared/layouts/AppLayout';

const dateFormatter = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' });

export function Profile() {
	const { user } = useAuth();

	if (!user) {
		return null;
	}

	return (
		<AppLayout>
			<div className="flex flex-col gap-8">
				<div className="flex flex-wrap items-end justify-between gap-4">
					<PageHeader title="Perfil" description="Seus dados de acesso e informações da conta." />
					<SignOutButton />
				</div>

				<Card>
					<CardContent className="flex flex-wrap items-center gap-x-5 gap-y-4">
						<UserAvatar name={user.name} image={user.image} className="size-14" />

						<div className="flex min-w-0 flex-col gap-0.5">
							<span className="truncate font-bold">{user.name}</span>
							<span className="text-muted-foreground truncate text-sm">{user.email}</span>
						</div>

						<div className="flex items-center gap-4 sm:ml-auto">
							<span className="text-muted-foreground text-xs">
								Na equipe desde {dateFormatter.format(new Date(user.createdAt))}
							</span>
							<RoleBadge role={user.role ?? null} />
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="flex flex-col gap-8">
						<FormSection title="Dados da conta" description="Como seu nome aparece no sistema.">
							<ProfileForm userId={user.id} defaultValues={{ name: user.name }} />
						</FormSection>

						<Separator />

						<FormSection
							title="Senha"
							description="Ao alterar, as sessões abertas em outros dispositivos são encerradas."
						>
							<ChangePasswordForm />
						</FormSection>
					</CardContent>
				</Card>
			</div>
		</AppLayout>
	);
}
