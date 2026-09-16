import { SignInForm } from '@/modules/auth/components/SignInForm';
import { AuthLayout } from '@/shared/layouts/AuthLayout';

export function SignIn() {
	return (
		<AuthLayout title="Faça o seu login">
			<SignInForm />
		</AuthLayout>
	);
}
