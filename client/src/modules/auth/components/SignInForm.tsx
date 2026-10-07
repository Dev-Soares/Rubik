import { zodResolver } from '@hookform/resolvers/zod';
import { LockIcon, UserIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useSignIn } from '@/modules/auth/hooks/useSignIn';
import { signInSchema, type SignInInput } from '@/modules/auth/types/auth';
import { FormField } from '@/shared/components/FormField';
import { Button } from '@/shared/components/ui/button';

export function SignInForm() {
	const { mutate: signIn, isPending } = useSignIn();
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<SignInInput>({ resolver: zodResolver(signInSchema) });

	return (
		<form onSubmit={handleSubmit((data) => signIn(data))} className="flex flex-col gap-3.5 lg:gap-4">
			<FormField
				label="E-mail"
				type="email"
				icon={UserIcon}
				placeholder="Digite seu e-mail..."
				autoComplete="email"
				error={errors.email?.message}
				{...register('email')}
			/>
			<FormField
				label="Senha"
				type="password"
				icon={LockIcon}
				placeholder="Digite sua senha..."
				autoComplete="current-password"
				error={errors.password?.message}
				{...register('password')}
			/>

			<Button
				type="submit"
				className="mt-5 h-14 w-full text-lg font-bold lg:mt-0 lg:h-11 lg:text-sm"
				disabled={isPending}
			>
				{isPending ? 'Entrando...' : 'Entrar'}
			</Button>
		</form>
	);
}
