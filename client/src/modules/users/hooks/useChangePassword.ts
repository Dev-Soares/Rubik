import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { changePasswordService } from '@/modules/users/service/userService';
import type { ChangePasswordInput } from '@/modules/users/types/user';

export function useChangePassword(onChanged?: () => void) {
	return useMutation({
		mutationFn: (input: ChangePasswordInput) => changePasswordService(input),
		onSuccess: () => {
			toast.success('Senha alterada.');
			onChanged?.();
		},
	});
}
