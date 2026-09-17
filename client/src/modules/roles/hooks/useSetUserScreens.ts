import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getErrorMessage } from '@/api/axios';
import { setUserScreensService } from '@/modules/roles/service/roleService';
import type { ScreenOverride } from '@/modules/roles/types/role';

/** Erro de submit aparece inline no formulário (`error`), não como toast. */
export function useSetUserScreens(userId: string, onSaved?: () => void) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (overrides: ScreenOverride[]) => {
			try {
				return await setUserScreensService(userId, overrides);
			} catch (error) {
				throw new Error(getErrorMessage(error));
			}
		},
		onSuccess: async () => {
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: ['roles', 'users', userId, 'screens'] }),
				// O próprio usuário pode estar editando a si mesmo: a sidebar dele muda.
				queryClient.invalidateQueries({ queryKey: ['roles', 'me', 'screens'] }),
			]);
			toast.success('Permissões atualizadas.');
			onSaved?.();
		},
	});
}
