import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getErrorMessage } from '@/api/axios';
import { deleteUserService } from '@/modules/users/service/userService';

export function useDeleteUser() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => deleteUserService(id),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ['users'] });
			toast.success('Usuário removido.');
		},
		onError: (error) => toast.error(getErrorMessage(error)),
	});
}
