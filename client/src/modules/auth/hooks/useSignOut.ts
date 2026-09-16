import { useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { queryClient } from '@/api/query-client';
import { signOutService } from '@/modules/auth/service/authService';

export function useSignOut() {
	const navigate = useNavigate();

	return useMutation({
		mutationFn: signOutService,
		onSuccess: async () => {
			queryClient.clear();
			await navigate({ to: '/' });
		},
		onError: (error: Error) => toast.error(error.message),
	});
}
