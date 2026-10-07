import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getErrorMessage } from '@/api/axios';
import { banUserService, unbanUserService } from '@/modules/users/service/userService';

/**
 * Inativa ou reativa a conta. São duas chamadas distintas do Better Auth, mas um
 * alvo só — o `banned` da linha decide qual, e a listagem precisa invalidar nos
 * dois casos.
 */
export function useToggleUserActive(id: string, isBanned: boolean) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: () => (isBanned ? unbanUserService(id) : banUserService(id)),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ['users'] });
			toast.success(isBanned ? 'Usuário reativado.' : 'Usuário inativado.');
		},
		onError: (error) => toast.error(getErrorMessage(error)),
	});
}
