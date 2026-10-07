import { SignInForm } from '@/modules/auth/components/SignInForm';
import { AuthLayout } from '@/shared/layouts/AuthLayout';

export function SignIn() {
	return (
		<AuthLayout title="Login">
			<SignInForm />
		</AuthLayout>
	);
}
