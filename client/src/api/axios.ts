import axios from 'axios';

export const api = axios.create({
	baseURL: import.meta.env.VITE_API_URL,
	withCredentials: true,
	headers: { 'Content-Type': 'application/json' },
});

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
	return 'Algo deu errado. Tente novamente.';
}
