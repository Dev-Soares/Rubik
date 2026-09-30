import { QueryClient } from '@tanstack/react-query';
import axios from 'axios';

const STALE_TIME_MS = 1000 * 60;
const MAX_RETRIES = 2;
const RETRY_BASE_DELAY_MS = 500;
const RETRY_MAX_DELAY_MS = 5000;

const CLIENT_ERROR_MIN = 400;
const CLIENT_ERROR_MAX = 499;
const TOO_MANY_REQUESTS = 429;

/**
 * Repetir só faz sentido quando o erro é transitório.
 *
 * 4xx é decisão do servidor — 401 expirou, 403 não pode, 404 não existe, 422
 * é payload inválido. Repetir dá o mesmo resultado, três vezes mais devagar, e
 * atrasa a mensagem de erro que o usuário precisa ver. Exceção: 429, que é
 * explicitamente "tente de novo mais tarde".
 */
function shouldRetry(failureCount: number, error: unknown): boolean {
	if (failureCount >= MAX_RETRIES) {
		return false;
	}

	if (axios.isAxiosError(error)) {
		const status = error.response?.status;

		// Sem resposta = rede caiu ou timeout. Transitório, vale repetir.
		if (status === undefined) {
			return true;
		}

		if (status === TOO_MANY_REQUESTS) {
			return true;
		}

		if (status >= CLIENT_ERROR_MIN && status <= CLIENT_ERROR_MAX) {
			return false;
		}
	}

	return true;
}

/** Backoff exponencial com teto, para não empilhar retentativa em servidor já sobrecarregado. */
function retryDelay(attemptIndex: number): number {
	return Math.min(RETRY_BASE_DELAY_MS * 2 ** attemptIndex, RETRY_MAX_DELAY_MS);
}

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: STALE_TIME_MS,
			retry: shouldRetry,
			retryDelay,
			refetchOnWindowFocus: false,
		},
		mutations: {
			/**
			 * Mutation não é idempotente: repetir um POST de criação sozinho gera
			 * registro duplicado. Retentativa aqui é decisão do usuário, clicando
			 * de novo — nunca automática.
			 */
			retry: false,
		},
	},
});
