import axios from 'axios';
import { logError } from '@/shared/utils/logger';

export const api = axios.create({
	baseURL: import.meta.env.VITE_API_URL,
	withCredentials: true,
	headers: { 'Content-Type': 'application/json' },
});

const UNAUTHORIZED = 401;
const REQUEST_ID_HEADER = 'x-request-id';

/**
 * Um id por requisição, gerado no client e ecoado pelo servidor. É o que liga
 * um erro visto na tela ao log do backend sem depender de horário aproximado.
 */
api.interceptors.request.use((config) => {
	config.headers.set(REQUEST_ID_HEADER, crypto.randomUUID());
	return config;
});

/** Id de correlação de um erro de API, quando houver. */
export function getRequestId(error: unknown): string | undefined {
	if (!axios.isAxiosError(error)) {
		return undefined;
	}

	const fromBody = (error.response?.data as { requestId?: unknown } | undefined)?.requestId;
	if (typeof fromBody === 'string') {
		return fromBody;
	}

	const fromHeader = error.response?.headers?.[REQUEST_ID_HEADER];
	return typeof fromHeader === 'string' ? fromHeader : undefined;
}

/**
 * Sessão expirada no meio do uso: manda para o login preservando o destino.
 * Não intercepta se já estamos no login, para não criar laço de redirect.
 */
api.interceptors.response.use(
	(response) => response,
	(error: unknown) => {
		if (axios.isAxiosError(error)) {
			if (error.response?.status === UNAUTHORIZED) {
				const { pathname, search } = window.location;
				if (pathname !== '/') {
					const redirect = encodeURIComponent(`${pathname}${search}`);
					window.location.assign(`/?redirect=${redirect}`);
				}
			} else {
				// 401 é fluxo esperado de sessão expirada; o resto é falha real.
				logError('requisição falhou', error, {
					status: error.response?.status,
					method: error.config?.method,
					url: error.config?.url,
					requestId: getRequestId(error),
				});
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
