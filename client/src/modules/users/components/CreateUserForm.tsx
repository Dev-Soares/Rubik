import { zodResolver } from '@hookform/resolvers/zod';
import { IdCardIcon, LockIcon, MailIcon } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { useCreateUser } from '@/modules/users/hooks/useCreateUser';
import { createUserSchema, type CreateUserInput } from '@/modules/users/types/user';
import { FormError } from '@/shared/components/FormError';
import { FormField } from '@/shared/components/FormField';
import { SelectField, type SelectOption } from '@/shared/components/SelectField';
import { Button } from '@/shared/components/ui/button';
import { DialogClose, DialogFooter } from '@/shared/components/ui/dialog';

const ROLE_OPTIONS: SelectOption[] = [
	{ value: 'user', label: 'Usuário' },
	{ value: 'admin', label: 'Administrador' },
];

type CreateUserFormProps = {
	onCreated?: () => void;
};

export function CreateUserForm({ onCreated }: CreateUserFormProps) {
	const {
		register,
		control,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<CreateUserInput>({
		resolver: zodResolver(createUserSchema),
		defaultValues: { role: 'user' },
	});

	const {
		mutate: createUser,
		isPending,
		error,
	} = useCreateUser(() => {
		reset({ name: '', email: '', password: '', role: 'user' });
		onCreated?.();
	});

	return (
		<form onSubmit={handleSubmit((data) => createUser(data))} className="flex flex-col gap-6">
			<fieldset disabled={isPending} className="contents">
				<FormField
					label="Nome"
					icon={IdCardIcon}
					placeholder="Nome completo"
					autoFocus
					error={errors.name?.message}
					{...register('name')}
				/>
				<FormField
					label="E-mail"
					type="email"
					icon={MailIcon}
					placeholder="usuario@empresa.com"
					error={errors.email?.message}
					{...register('email')}
				/>
				<FormField
					label="Senha provisória"
					type="password"
					icon={LockIcon}
					placeholder="Mínimo 8 caracteres"
					hint="O usuário pode alterar depois no perfil."
					error={errors.password?.message}
					{...register('password')}
				/>

				{/* Select do Radix não é input nativo: precisa de Controller. */}
				<Controller
					control={control}
					name="role"
					render={({ field }) => (
						<SelectField
							label="Papel"
							options={ROLE_OPTIONS}
							name={field.name}
							value={field.value}
							onChange={field.onChange}
							onBlur={field.onBlur}
							disabled={isPending}
							error={errors.role?.message}
						/>
					)}
				/>

				<FormError message={error?.message} />

				<DialogFooter>
					<DialogClose asChild>
						<Button type="button" variant="ghost">
							Cancelar
						</Button>
					</DialogClose>
					<Button type="submit" disabled={isPending}>
						{isPending ? 'Criando...' : 'Criar usuário'}
					</Button>
				</DialogFooter>
			</fieldset>
		</form>
	);
}
