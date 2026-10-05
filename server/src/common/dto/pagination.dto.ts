import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

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
	offset: number = 0;
}
