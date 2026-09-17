import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getErrorMessage } from '@/api/axios';
import { updateRoleService } from '@/modules/roles/service/roleService';
import type { RoleFormInput } from '@/modules/roles/types/role';

/** Erro de submit aparece inline no formulário (`error`), não como toast. */
export function useUpdateRole(id: string, onUpdated?: () => void) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (input: RoleFormInput) => {
			try {
				return await updateRoleService(id, input);
			} catch (error) {
				throw new Error(getErrorMessage(error));
			}
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ['roles'] });
			toast.success('Cargo atualizado.');
			onUpdated?.();
		},
	});
}
