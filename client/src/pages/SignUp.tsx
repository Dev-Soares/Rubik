import { SignUpForm } from '@/modules/auth/components/SignUpForm';
import { AuthLayout } from '@/shared/layouts/AuthLayout';

export function SignUp() {
	return (
		<AuthLayout title="Crie a sua conta">
			<SignUpForm />
		</AuthLayout>
	);
}
