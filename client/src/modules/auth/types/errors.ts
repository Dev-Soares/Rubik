/**
 * Mensagens do Better Auth em pt-BR.
 *
 * A lib responde em inglês; o mapa traduz pelo `code` (estável entre versões),
 * com fallback pela mensagem original quando o código não vier.
 */
export const AUTH_ERROR_MESSAGES: Record<string, string> = {
	INVALID_EMAIL_OR_PASSWORD: 'E-mail ou senha incorretos.',
	INVALID_EMAIL: 'E-mail inválido.',
	INVALID_PASSWORD: 'Senha incorreta.',
	USER_NOT_FOUND: 'Usuário não encontrado.',
	USER_ALREADY_EXISTS: 'Já existe uma conta com este e-mail.',
	EMAIL_NOT_VERIFIED: 'Confirme seu e-mail antes de entrar.',
	PASSWORD_TOO_SHORT: 'A senha é muito curta.',
	PASSWORD_TOO_LONG: 'A senha é muito longa.',
	CREDENTIAL_ACCOUNT_NOT_FOUND: 'Conta não encontrada.',
	SESSION_EXPIRED: 'Sua sessão expirou. Entre novamente.',
	FAILED_TO_CREATE_USER: 'Não foi possível criar o usuário.',
	FAILED_TO_UPDATE_USER: 'Não foi possível atualizar o usuário.',
	EMAIL_PASSWORD_SIGN_UP_DISABLED: 'O cadastro público está desativado.',
	YOU_ARE_NOT_ALLOWED_TO_CREATE_USERS: 'Você não tem permissão para criar usuários.',
	BANNED_USER: 'Esta conta está bloqueada.',
	TOO_MANY_REQUESTS: 'Muitas tentativas. Aguarde um momento e tente de novo.',
};

/** Fallback por texto, para respostas sem `code`. */
const MESSAGE_FALLBACK: Record<string, string> = {
	'invalid email or password': 'E-mail ou senha incorretos.',
	'user not found': 'Usuário não encontrado.',
	'user already exists': 'Já existe uma conta com este e-mail.',
	'invalid email': 'E-mail inválido.',
};

export function translateAuthError(error: { code?: string; message?: string } | null): string {
	if (!error) {
		return 'Algo deu errado. Tente novamente.';
	}

	if (error.code && AUTH_ERROR_MESSAGES[error.code]) {
		return AUTH_ERROR_MESSAGES[error.code];
	}

	const byMessage = error.message && MESSAGE_FALLBACK[error.message.toLowerCase()];
	if (byMessage) {
		return byMessage;
	}

	return error.message ?? 'Algo deu errado. Tente novamente.';
}
