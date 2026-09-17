import { zodResolver } from '@hookform/resolvers/zod';
import { LockIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useChangePassword } from '@/modules/users/hooks/useChangePassword';
import { changePasswordSchema, type ChangePasswordInput } from '@/modules/users/types/user';
import { FormError } from '@/shared/components/FormError';
import { FormField } from '@/shared/components/FormField';
import { Button } from '@/shared/components/ui/button';

export function ChangePasswordForm() {
	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<ChangePasswordInput>({ resolver: zodResolver(changePasswordSchema) });

	const {
		mutate: changePassword,
		isPending,
		error,
	} = useChangePassword(() => {
		reset({ currentPassword: '', newPassword: '', confirmPassword: '' });
	});

	return (
		<form
			onSubmit={handleSubmit((data) => changePassword(data))}
			className="flex flex-col gap-5"
		>
			<fieldset disabled={isPending} className="contents">
				<FormField
					label="Senha atual"
					type="password"
					icon={LockIcon}
					placeholder="Digite a senha atual..."
					autoComplete="current-password"
					error={errors.currentPassword?.message}
					{...register('currentPassword')}
				/>
				<FormField
					label="Nova senha"
					type="password"
					icon={LockIcon}
					placeholder="Mínimo 8 caracteres"
					autoComplete="new-password"
					error={errors.newPassword?.message}
					{...register('newPassword')}
				/>
				<FormField
					label="Confirmar nova senha"
					type="password"
					icon={LockIcon}
					placeholder="Repita a nova senha"
					autoComplete="new-password"
					hint="As outras sessões serão encerradas."
					error={errors.confirmPassword?.message}
					{...register('confirmPassword')}
				/>

				<FormError message={error?.message} />

				<Button type="submit" className="w-fit" disabled={isPending}>
					{isPending ? 'Alterando...' : 'Alterar senha'}
				</Button>
			</fieldset>
		</form>
	);
}
