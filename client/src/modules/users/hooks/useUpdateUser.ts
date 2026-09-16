import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getErrorMessage } from '@/api/axios';
import { updateUserService } from '@/modules/users/service/userService';
import type { UpdateUserInput } from '@/modules/users/types/user';

export function useUpdateUser(id: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: UpdateUserInput) => updateUserService(id, input),
		onSuccess: async () => {
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: ['session'] }),
				queryClient.invalidateQueries({ queryKey: ['users'] }),
			]);
			toast.success('Perfil atualizado.');
		},
		onError: (error) => toast.error(getErrorMessage(error)),
	});
}
