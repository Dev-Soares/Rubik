import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useUpdateUser } from '@/modules/users/hooks/useUpdateUser';
import { updateUserSchema, type UpdateUserInput } from '@/modules/users/types/user';
import { FormField } from '@/shared/components/FormField';
import { Button } from '@/shared/components/ui/button';

type ProfileFormProps = {
	userId: string;
	defaultValues: UpdateUserInput;
};

export function ProfileForm({ userId, defaultValues }: ProfileFormProps) {
	const { mutate: updateUser, isPending } = useUpdateUser(userId);
	const {
		register,
		handleSubmit,
		formState: { errors, isDirty },
	} = useForm<UpdateUserInput>({
		resolver: zodResolver(updateUserSchema),
		defaultValues,
	});

	return (
		<form
			onSubmit={handleSubmit((data) => updateUser(data))}
			className="flex max-w-sm flex-col gap-4"
		>
			<FormField label="Nome" error={errors.name?.message} {...register('name')} />
			<FormField
				label="URL do avatar"
				placeholder="https://exemplo.com/avatar.png"
				error={errors.image?.message}
				{...register('image')}
			/>

			<Button type="submit" disabled={isPending || !isDirty}>
				{isPending ? 'Salvando...' : 'Salvar alterações'}
			</Button>
		</form>
	);
}
