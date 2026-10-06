import { zodResolver } from '@hookform/resolvers/zod';
import { IdCardIcon, TextIcon } from 'lucide-react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { useCreateRole } from '@/modules/roles/hooks/useCreateRole';
import { useUpdateRole } from '@/modules/roles/hooks/useUpdateRole';
import { BadgeField } from '@/modules/roles/components/BadgeField';
import { PermissionsField } from '@/modules/roles/components/PermissionsField';
import { roleFormSchema, type Role, type RoleFormInput } from '@/modules/roles/types/role';
import { FormError } from '@/shared/components/FormError';
import { FormField } from '@/shared/components/FormField';
import { Button } from '@/shared/components/ui/button';
import { DialogBody, DialogClose, DialogFooter } from '@/shared/components/ui/dialog';

const EMPTY: RoleFormInput = {
	name: '',
	description: '',
	permissions: [],
	color: 'neutral',
	icon: 'pessoa',
};

type RoleFormProps = {
	/** Ausente = criação. Presente = edição. */
	role?: Role;
	onDone?: () => void;
};

export function RoleForm({ role, onDone }: RoleFormProps) {
	const {
		register,
		control,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<RoleFormInput>({
		resolver: zodResolver(roleFormSchema),
		defaultValues: role
			? {
					name: role.name,
					description: role.description ?? '',
					permissions: role.permissions,
					color: role.color,
					icon: role.icon,
				}
			: EMPTY,
	});

	const create = useCreateRole(() => {
		reset(EMPTY);
		onDone?.();
	});
	const update = useUpdateRole(role?.id ?? '', onDone);

	const { mutate, isPending, error } = role ? update : create;

	// A prévia do crachá acompanha o que está sendo digitado.
	const name = useWatch({ control, name: 'name' });

	return (
		<form onSubmit={handleSubmit((data) => mutate(data))} className="flex min-h-0 flex-1 flex-col">
			<fieldset disabled={isPending} className="contents">
				<DialogBody className="gap-6">
					<FormField
						label="Nome"
						icon={IdCardIcon}
						placeholder="Ex: Financeiro"
						autoFocus
						// Renomear cargo de sistema é recusado pelo backend.
						disabled={role?.isSystem}
						hint={role?.isSystem ? 'Cargo de sistema: o nome não pode mudar.' : undefined}
						error={errors.name?.message}
						{...register('name')}
					/>
					<FormField
						label="Descrição"
						icon={TextIcon}
						placeholder="Para que serve este cargo"
						error={errors.description?.message}
						{...register('description')}
					/>

					<Controller
						control={control}
						name="color"
						render={({ field: colorField }) => (
							<Controller
								control={control}
								name="icon"
								render={({ field: iconField }) => (
									<BadgeField
										name={name}
										color={colorField.value}
										icon={iconField.value}
										onColorChange={colorField.onChange}
										onIconChange={iconField.onChange}
										disabled={isPending}
									/>
								)}
							/>
						)}
					/>

					<Controller
						control={control}
						name="permissions"
						render={({ field }) => (
							<PermissionsField
								value={field.value}
								onChange={field.onChange}
								disabled={isPending}
								error={errors.permissions?.message}
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
						{isPending ? 'Salvando...' : role ? 'Salvar alterações' : 'Criar cargo'}
					</Button>
				</DialogFooter>
			</fieldset>
		</form>
	);
}
