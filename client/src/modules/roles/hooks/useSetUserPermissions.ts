import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getErrorMessage } from '@/api/axios';
import { setUserPermissionsService } from '@/modules/roles/service/roleService';
import type { PermissionOverride } from '@/modules/roles/types/role';

/** Erro de submit aparece inline no formulário (`error`), não como toast. */
export function useSetUserPermissions(userId: string, onSaved?: () => void) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (overrides: PermissionOverride[]) => {
			try {
				return await setUserPermissionsService(userId, overrides);
			} catch (error) {
				throw new Error(getErrorMessage(error));
			}
		},
		onSuccess: async () => {
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: ['roles', 'users', userId, 'permissions'] }),
				// O próprio usuário pode estar editando a si mesmo: a sidebar dele muda.
				queryClient.invalidateQueries({ queryKey: ['roles', 'me', 'permissions'] }),
			]);
			toast.success('Permissões atualizadas.');
			onSaved?.();
		},
	});
}
