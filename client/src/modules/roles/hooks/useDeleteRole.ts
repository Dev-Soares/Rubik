import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getErrorMessage } from '@/api/axios';
import { deleteRoleService } from '@/modules/roles/service/roleService';

export function useDeleteRole() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => deleteRoleService(id),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ['roles'] });
			toast.success('Cargo removido.');
		},
		onError: (error) => toast.error(getErrorMessage(error)),
	});
}
