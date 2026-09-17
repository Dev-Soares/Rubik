import { useMutation } from '@tanstack/react-query';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { toast } from 'sonner';
import { queryClient } from '@/api/query-client';
import { signInService } from '@/modules/auth/service/authService';
import type { SignInInput } from '@/modules/auth/types/auth';

export function useSignIn() {
	const navigate = useNavigate();
	const { redirect } = useSearch({ from: '/' });

	return useMutation({
		mutationFn: (input: SignInInput) => signInService(input),
		onSuccess: async () => {
			// `refetchQueries` (e não `invalidateQueries`) porque precisamos da
			// sessão já no cache antes de navegar: o `beforeLoad` da rota
			// protegida lê o cache e devolveria `null`, voltando para o login.
			await queryClient.refetchQueries({ queryKey: ['session'] });
			await navigate({ to: redirect ?? '/inicio' });
		},
		onError: (error: Error) => toast.error(error.message),
	});
}
