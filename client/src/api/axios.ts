import axios from 'axios';

export const api = axios.create({
	baseURL: import.meta.env.VITE_API_URL,
	withCredentials: true,
	headers: { 'Content-Type': 'application/json' },
});

const UNAUTHORIZED = 401;

/**
 * Sessão expirada no meio do uso: manda para o login preservando o destino.
 * Não intercepta se já estamos no login, para não criar laço de redirect.
 */
api.interceptors.response.use(
	(response) => response,
	(error: unknown) => {
		if (axios.isAxiosError(error) && error.response?.status === UNAUTHORIZED) {
			const { pathname, search } = window.location;
			if (pathname !== '/') {
				const redirect = encodeURIComponent(`${pathname}${search}`);
				window.location.assign(`/?redirect=${redirect}`);
			}
		}
		return Promise.reject(error instanceof Error ? error : new Error(String(error)));
	},
);

/** Extrai a mensagem de erro da API em pt-BR, com fallback genérico. */
export function getErrorMessage(error: unknown): string {
	if (axios.isAxiosError(error)) {
		const message = error.response?.data?.message;
		if (Array.isArray(message)) {
			return message.join(', ');
		}
		if (typeof message === 'string') {
			return message;
		}
	}

	if (error instanceof Error && error.message) {
		return error.message;
	}

	return 'Algo deu errado. Tente novamente.';
}
