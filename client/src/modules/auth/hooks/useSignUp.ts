import { useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { queryClient } from '@/api/query-client';
import { signUpService } from '@/modules/auth/service/authService';
import type { SignUpInput } from '@/modules/auth/types/auth';

export function useSignUp() {
	const navigate = useNavigate();

	return useMutation({
		mutationFn: (input: SignUpInput) => signUpService(input),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ['session'] });
			toast.success('Conta criada com sucesso.');
			await navigate({ to: '/dashboard' });
		},
		onError: (error: Error) => toast.error(error.message),
	});
}
