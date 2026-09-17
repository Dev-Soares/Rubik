import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { AUDIT_ACTIONS } from 'src/modules/audit/types/audit.types';
import type { AuditAction } from 'src/modules/audit/types/audit.types';

export class QueryAuditDto extends PaginationDto {
	/** Busca pelo nome ou e-mail de quem fez a ação. */
	@ApiPropertyOptional({ example: 'maria' })
	@IsOptional()
	@IsString({ message: 'search deve ser um texto.' })
	@MaxLength(100, { message: 'search deve ter no máximo 100 caracteres.' })
	search?: string;

	/** Filtra pelo autor da ação. */
	@ApiPropertyOptional({ description: 'Id do usuário que fez a ação.' })
	@IsOptional()
	@IsString({ message: 'userId deve ser um texto.' })
	userId?: string;

	/** Filtra pelo tipo de ação. */
	@ApiPropertyOptional({ enum: AUDIT_ACTIONS })
	@IsOptional()
	@IsIn(AUDIT_ACTIONS, { message: 'action deve ser create, update ou delete.' })
	action?: AuditAction;

	/** Filtra pelo recurso afetado (ex: `users`). */
	@ApiPropertyOptional({ example: 'users' })
	@IsOptional()
	@IsString({ message: 'entity deve ser um texto.' })
	entity?: string;

	/** Início do período, inclusivo. */
	@ApiPropertyOptional({ example: '2026-01-01' })
	@IsOptional()
	@IsDateString({}, { message: 'from deve ser uma data válida.' })
	from?: string;

	/** Fim do período, inclusivo. */
	@ApiPropertyOptional({ example: '2026-01-31' })
	@IsOptional()
	@IsDateString({}, { message: 'to deve ser uma data válida.' })
	to?: string;
}
