import { timingSafeEqual } from 'node:crypto';

/**
 * Compara segredos em tempo constante. `===` sai no primeiro byte diferente e
 * o tempo de resposta vaza quanto do segredo o atacante já acertou.
 */
export function secretMatches(provided: string, expected: string): boolean {
	const providedBytes = Buffer.from(provided);
	const expectedBytes = Buffer.from(expected);

	// `timingSafeEqual` exige o mesmo tamanho: comprimento diferente já é
	// recusa, e comparar contra si mesmo mantém o custo constante.
	if (providedBytes.length !== expectedBytes.length) {
		timingSafeEqual(expectedBytes, expectedBytes);
		return false;
	}

	return timingSafeEqual(providedBytes, expectedBytes);
}
