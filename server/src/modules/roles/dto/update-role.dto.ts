import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { SCREENS } from 'src/modules/roles/types/role.types';
import type { Screen } from 'src/modules/roles/types/role.types';

export class UpdateRoleDto {
	/** Nome do cargo, único. */
	@ApiPropertyOptional({ example: 'Financeiro' })
	@IsOptional()
	@IsString({ message: 'name deve ser um texto.' })
	@MinLength(2, { message: 'name deve ter no mínimo 2 caracteres.' })
	@MaxLength(50, { message: 'name deve ter no máximo 50 caracteres.' })
	name?: string;

	/** Para que serve o cargo. */
	@ApiPropertyOptional({ example: 'Acesso às telas de cobrança.' })
	@IsOptional()
	@IsString({ message: 'description deve ser um texto.' })
	@MaxLength(200, { message: 'description deve ter no máximo 200 caracteres.' })
	description?: string;

	/** Telas que o cargo enxerga. */
	@ApiPropertyOptional({ example: ['admin.users'], enum: SCREENS, isArray: true })
	@IsOptional()
	@IsArray({ message: 'screens deve ser uma lista.' })
	@IsIn(SCREENS, { each: true, message: 'screens contém uma tela inexistente.' })
	screens?: Screen[];
}
