import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getErrorMessage } from '@/api/axios';
import { updateUserService } from '@/modules/users/service/userService';
import type { EditUserInput } from '@/modules/users/types/user';

/**
 * Edição pela tela de administração: nome e cargo. Diferente de `useUpdateUser`,
 * que é o perfil do próprio usuário e não mexe em cargo.
 *
 * Erro de submit aparece inline no formulário (`error`), não como toast.
 */
export function useEditUser(id: string, onEdited?: () => void) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (input: EditUserInput) => {
			try {
				return await updateUserService(id, input);
			} catch (error) {
				// A recusa do backend (cargo inexistente, por ex.) precisa chegar ao form.
				throw new Error(getErrorMessage(error));
			}
		},
		onSuccess: async () => {
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: ['users'] }),
				// O cargo muda as telas que a pessoa enxerga.
				queryClient.invalidateQueries({ queryKey: ['roles'] }),
			]);
			toast.success('Usuário atualizado.');
			onEdited?.();
		},
	});
}
