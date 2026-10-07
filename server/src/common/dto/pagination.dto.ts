import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

/**
 * Teto do `offset`. Paginação por offset faz o Postgres materializar e
 * descartar tudo que vem antes, então `offset` alto é trabalho proporcional
 * ao número pulado — sem teto, `offset=5000000` em `audit_log` (que cresce uma
 * linha por mutação) é uma requisição lenta de graça para qualquer autenticado.
 *
 * yagni: 100 mil cobre 5000 páginas de 20, muito além de onde alguém chega
 * clicando "próxima". Se alguma tela precisar varrer o histórico inteiro, o
 * caminho é keyset (`WHERE (created_at, id) < (:cursor)`) — a ordenação por
 * `createdAt, id` que as listagens já usam existe exatamente para isso.
 */
const MAX_OFFSET = 100_000;

export class PaginationDto {
	/** Quantidade de itens por página. */
	@IsOptional()
	@Type(() => Number)
	@IsInt({ message: 'limit deve ser um número inteiro.' })
	@Min(1, { message: 'limit deve ser no mínimo 1.' })
	@Max(MAX_LIMIT, { message: `limit deve ser no máximo ${MAX_LIMIT}.` })
	limit: number = DEFAULT_LIMIT;

	/** Quantidade de itens a pular. */
	@IsOptional()
	@Type(() => Number)
	@IsInt({ message: 'offset deve ser um número inteiro.' })
	@Min(0, { message: 'offset deve ser no mínimo 0.' })
	@Max(MAX_OFFSET, { message: `offset deve ser no máximo ${MAX_OFFSET}.` })
	offset: number = 0;
}
