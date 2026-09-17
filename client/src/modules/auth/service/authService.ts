import { signIn, signOut } from '@/api/auth-client';
import { translateAuthError } from '@/modules/auth/types/errors';
import type { SignInInput } from '@/modules/auth/types/auth';

class AuthError extends Error {}

export async function signInService({ email, password }: SignInInput): Promise<void> {
	const { error } = await signIn.email({ email, password });
	if (error) {
		throw new AuthError(translateAuthError(error));
	}
}

export async function signOutService(): Promise<void> {
	const { error } = await signOut();
	if (error) {
		throw new AuthError(translateAuthError(error));
	}
}
