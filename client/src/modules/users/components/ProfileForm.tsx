import { zodResolver } from '@hookform/resolvers/zod';
import { IdCardIcon } from 'lucide-react';
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
			className="flex flex-col gap-5"
		>
			<FormField
				label="Nome"
				icon={IdCardIcon}
				error={errors.name?.message}
				{...register('name')}
			/>

			<Button type="submit" className="w-fit" disabled={isPending || !isDirty}>
				{isPending ? 'Salvando...' : 'Salvar alterações'}
			</Button>
		</form>
	);
}
