import { zodResolver } from '@hookform/resolvers/zod';
import { IdCardIcon } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { useRoles } from '@/modules/roles/hooks/useRoles';
import { useEditUser } from '@/modules/users/hooks/useEditUser';
import { editUserSchema, type EditUserInput, type User } from '@/modules/users/types/user';
import { FormError } from '@/shared/components/FormError';
import { FormField } from '@/shared/components/FormField';
import { SelectField } from '@/shared/components/SelectField';
import { Button } from '@/shared/components/ui/button';
import { DialogClose, DialogFooter } from '@/shared/components/ui/dialog';

const ROLES_PAGE_SIZE = 100;

type EditUserFormProps = {
	user: User;
	/** `true` quando é a própria conta: o backend recusa trocar o próprio cargo. */
	isSelf: boolean;
	onDone?: () => void;
};

export function EditUserForm({ user, isSelf, onDone }: EditUserFormProps) {
	const { data: roles } = useRoles(0, ROLES_PAGE_SIZE);

	const {
		register,
		control,
		handleSubmit,
		formState: { errors },
	} = useForm<EditUserInput>({
		resolver: zodResolver(editUserSchema),
		defaultValues: { name: user.name, role: user.role ?? '' },
	});

	const { mutate, isPending, error } = useEditUser(user.id, onDone);

	const roleOptions = roles.items.map((role) => ({ value: role.name, label: role.name }));

	return (
		<form onSubmit={handleSubmit((data) => mutate(data))} className="flex flex-col gap-6">
			<fieldset disabled={isPending} className="contents">
				<FormField
					label="Nome"
					icon={IdCardIcon}
					placeholder="Nome completo"
					autoFocus
					error={errors.name?.message}
					{...register('name')}
				/>

				{/* Select do Radix não é input nativo: precisa de Controller. */}
				<Controller
					control={control}
					name="role"
					render={({ field }) => (
						<SelectField
							label="Cargo"
							options={roleOptions}
							name={field.name}
							value={field.value}
							onChange={field.onChange}
							onBlur={field.onBlur}
							disabled={isPending || isSelf}
							hint={isSelf ? 'Você não pode alterar o seu próprio cargo.' : undefined}
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
						{isPending ? 'Salvando...' : 'Salvar alterações'}
					</Button>
				</DialogFooter>
			</fieldset>
		</form>
	);
}
