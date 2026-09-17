import { zodResolver } from '@hookform/resolvers/zod';
import { IdCardIcon, TextIcon } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { useCreateRole } from '@/modules/roles/hooks/useCreateRole';
import { useUpdateRole } from '@/modules/roles/hooks/useUpdateRole';
import { ScreensField } from '@/modules/roles/components/ScreensField';
import { roleFormSchema, type Role, type RoleFormInput } from '@/modules/roles/types/role';
import { FormError } from '@/shared/components/FormError';
import { FormField } from '@/shared/components/FormField';
import { Button } from '@/shared/components/ui/button';
import { DialogClose, DialogFooter } from '@/shared/components/ui/dialog';

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
		defaultValues: {
			name: role?.name ?? '',
			description: role?.description ?? '',
			screens: role?.screens ?? [],
		},
	});

	const create = useCreateRole(() => {
		reset({ name: '', description: '', screens: [] });
		onDone?.();
	});
	const update = useUpdateRole(role?.id ?? '', onDone);

	const { mutate, isPending, error } = role ? update : create;

	return (
		<form onSubmit={handleSubmit((data) => mutate(data))} className="flex flex-col gap-6">
			<fieldset disabled={isPending} className="contents">
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
					name="screens"
					render={({ field }) => (
						<ScreensField
							value={field.value}
							onChange={field.onChange}
							disabled={isPending}
							error={errors.screens?.message}
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
						{isPending ? 'Salvando...' : role ? 'Salvar alterações' : 'Criar cargo'}
					</Button>
				</DialogFooter>
			</fieldset>
		</form>
	);
}
