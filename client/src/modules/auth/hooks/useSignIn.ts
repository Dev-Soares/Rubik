import { useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { queryClient } from '@/api/query-client';
import { signInService } from '@/modules/auth/service/authService';
import type { SignInInput } from '@/modules/auth/types/auth';

export function useSignIn() {
	const navigate = useNavigate();

	return useMutation({
		mutationFn: (input: SignInInput) => signInService(input),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ['session'] });
			await navigate({ to: '/dashboard' });
		},
		onError: (error: Error) => toast.error(error.message),
	});
}
