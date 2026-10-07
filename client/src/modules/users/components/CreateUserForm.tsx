import { zodResolver } from '@hookform/resolvers/zod';
import { IdCardIcon, LockIcon, MailIcon } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { RolePickerField } from '@/modules/roles/components/RolePickerField';
import { useRoles } from '@/modules/roles/hooks/useRoles';
import { useCreateUser } from '@/modules/users/hooks/useCreateUser';
import { createUserSchema, type CreateUserInput } from '@/modules/users/types/user';
import { FormError } from '@/shared/components/FormError';
import { FormField } from '@/shared/components/FormField';
import { Button } from '@/shared/components/ui/button';
import { DialogBody, DialogClose, DialogFooter } from '@/shared/components/ui/dialog';

const ROLES_PAGE_SIZE = 100;

/** Cargo inicial de quem entra sem escolha explícita — existe pelo seed. */
const DEFAULT_ROLES = ['user'];

type CreateUserFormProps = {
	onCreated?: () => void;
};

export function CreateUserForm({ onCreated }: CreateUserFormProps) {
	const { data: roles } = useRoles(0, ROLES_PAGE_SIZE);

	const {
		register,
		control,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<CreateUserInput>({
		resolver: zodResolver(createUserSchema),
		defaultValues: { roles: DEFAULT_ROLES },
	});

	const {
		mutate: createUser,
		isPending,
		error,
	} = useCreateUser(() => {
		reset({ name: '', email: '', password: '', roles: DEFAULT_ROLES });
		onCreated?.();
	});

	return (
		<form
			onSubmit={handleSubmit((data) => createUser(data))}
			className="flex min-h-0 flex-1 flex-col"
		>
			<fieldset disabled={isPending} className="contents">
				<DialogBody className="gap-6">
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

					{/* Checkbox do Radix não é input nativo: precisa de Controller. */}
					<Controller
						control={control}
						name="roles"
						render={({ field }) => (
							<RolePickerField
								label="Cargos"
								roles={roles.items}
								name={field.name}
								value={field.value}
								onChange={field.onChange}
								onBlur={field.onBlur}
								disabled={isPending}
								hint="As permissões somam: o usuário recebe as telas de todos os cargos marcados."
								error={errors.roles?.message}
							/>
						)}
					/>

					<FormError message={error?.message} />
				</DialogBody>

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
