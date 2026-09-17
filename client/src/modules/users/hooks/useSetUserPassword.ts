import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { setUserPasswordService } from '@/modules/users/service/userService';

/**
 * Define a senha de outro usuário, sem exigir a atual. Não invalida query
 * alguma: senha não aparece em nenhuma listagem.
 *
 * Erro de submit aparece inline no formulário (`error`), não como toast.
 */
export function useSetUserPassword(userId: string, onDone?: () => void) {
	return useMutation({
		mutationFn: (newPassword: string) => setUserPasswordService({ userId, newPassword }),
		onSuccess: () => {
			toast.success('Senha alterada.');
			onDone?.();
		},
	});
}
