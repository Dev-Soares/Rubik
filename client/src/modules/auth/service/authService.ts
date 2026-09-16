import { signIn, signOut, signUp } from '@/api/auth-client';
import type { SignInInput, SignUpInput } from '@/modules/auth/types/auth';

class AuthError extends Error {}

export async function signInService({ email, password }: SignInInput): Promise<void> {
	const { error } = await signIn.email({ email, password });
	if (error) {
		throw new AuthError(error.message ?? 'Não foi possível entrar.');
	}
}

export async function signUpService({ name, email, password }: SignUpInput): Promise<void> {
	const { error } = await signUp.email({ name, email, password });
	if (error) {
		throw new AuthError(error.message ?? 'Não foi possível criar a conta.');
	}
}

export async function signOutService(): Promise<void> {
	const { error } = await signOut();
	if (error) {
		throw new AuthError(error.message ?? 'Não foi possível sair.');
	}
}
