import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from '@tanstack/react-router';
import { IdCardIcon, LockIcon, UserIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useSignUp } from '@/modules/auth/hooks/useSignUp';
import { signUpSchema, type SignUpInput } from '@/modules/auth/types/auth';
import { FormField } from '@/shared/components/FormField';
import { Button } from '@/shared/components/ui/button';

export function SignUpForm() {
	const { mutate: signUp, isPending } = useSignUp();
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<SignUpInput>({ resolver: zodResolver(signUpSchema) });

	return (
		<form onSubmit={handleSubmit((data) => signUp(data))} className="flex flex-col gap-4">
			<FormField
				label="Nome"
				icon={IdCardIcon}
				placeholder="Digite seu nome..."
				autoComplete="name"
				error={errors.name?.message}
				{...register('name')}
			/>
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
				placeholder="Crie uma senha..."
				autoComplete="new-password"
				error={errors.password?.message}
				{...register('password')}
			/>
			<FormField
				label="Confirmar senha"
				type="password"
				icon={LockIcon}
				placeholder="Repita a senha..."
				autoComplete="new-password"
				error={errors.confirmPassword?.message}
				{...register('confirmPassword')}
			/>

			<Button type="submit" className="h-11 w-full font-bold" disabled={isPending}>
				{isPending ? 'Criando...' : 'Criar conta'}
			</Button>

			<p className="text-muted-foreground text-center text-sm">
				Já tem conta?{' '}
				<Link to="/" className="text-primary font-medium hover:underline">
					Entrar
				</Link>
			</p>
		</form>
	);
}
