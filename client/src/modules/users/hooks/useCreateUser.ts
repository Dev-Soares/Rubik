import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createUserService } from '@/modules/users/service/userService';
import type { CreateUserInput } from '@/modules/users/types/user';

/** Erro de submit aparece inline no formulário (`error`), não como toast. */
export function useCreateUser(onCreated?: () => void) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: CreateUserInput) => createUserService(input),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ['users'] });
			toast.success('Usuário criado.');
			onCreated?.();
		},
	});
}
