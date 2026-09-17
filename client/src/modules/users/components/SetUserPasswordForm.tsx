import { zodResolver } from '@hookform/resolvers/zod';
import { LockIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useSetUserPassword } from '@/modules/users/hooks/useSetUserPassword';
import {
	setUserPasswordSchema,
	type SetUserPasswordFormInput,
} from '@/modules/users/types/user';
import { FormError } from '@/shared/components/FormError';
import { FormField } from '@/shared/components/FormField';
import { Button } from '@/shared/components/ui/button';
import { DialogClose, DialogFooter } from '@/shared/components/ui/dialog';

type SetUserPasswordFormProps = {
	userId: string;
	onDone?: () => void;
};

export function SetUserPasswordForm({ userId, onDone }: SetUserPasswordFormProps) {
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<SetUserPasswordFormInput>({ resolver: zodResolver(setUserPasswordSchema) });

	const { mutate, isPending, error } = useSetUserPassword(userId, onDone);

	return (
		<form
			onSubmit={handleSubmit((data) => mutate(data.newPassword))}
			className="flex flex-col gap-6"
		>
			<fieldset disabled={isPending} className="contents">
				<FormField
					label="Nova senha"
					type="password"
					icon={LockIcon}
					placeholder="Mínimo 8 caracteres"
					autoFocus
					hint="O usuário pode trocar depois no perfil."
					error={errors.newPassword?.message}
					{...register('newPassword')}
				/>
				<FormField
					label="Confirme a nova senha"
					type="password"
					icon={LockIcon}
					placeholder="Repita a senha"
					error={errors.confirmPassword?.message}
					{...register('confirmPassword')}
				/>

				<FormError message={error?.message} />

				<DialogFooter>
					<DialogClose asChild>
						<Button type="button" variant="ghost">
							Cancelar
						</Button>
					</DialogClose>
					<Button type="submit" disabled={isPending}>
						{isPending ? 'Salvando...' : 'Alterar senha'}
					</Button>
				</DialogFooter>
			</fieldset>
		</form>
	);
}
