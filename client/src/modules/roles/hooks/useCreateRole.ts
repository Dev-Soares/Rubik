import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getErrorMessage } from '@/api/axios';
import { createRoleService } from '@/modules/roles/service/roleService';
import type { RoleFormInput } from '@/modules/roles/types/role';

/** Erro de submit aparece inline no formulário (`error`), não como toast. */
export function useCreateRole(onCreated?: () => void) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (input: RoleFormInput) => {
			try {
				return await createRoleService(input);
			} catch (error) {
				// A mensagem do backend (nome duplicado, por ex.) precisa chegar ao form.
				throw new Error(getErrorMessage(error));
			}
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ['roles'] });
			toast.success('Cargo criado.');
			onCreated?.();
		},
	});
}
