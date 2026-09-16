import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from '@tanstack/react-router';
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
		<form onSubmit={handleSubmit((data) => signIn(data))} className="flex flex-col gap-4">
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

			<Button type="submit" className="h-11 w-full font-bold" disabled={isPending}>
				{isPending ? 'Entrando...' : 'Entrar'}
			</Button>

			<p className="text-muted-foreground text-center text-sm">
				Não tem conta?{' '}
				<Link to="/sign-up" className="text-primary font-medium hover:underline">
					Criar conta
				</Link>
			</p>
		</form>
	);
}
