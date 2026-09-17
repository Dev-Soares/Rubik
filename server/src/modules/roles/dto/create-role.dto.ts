import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { SCREEN_PERMISSIONS } from 'src/modules/roles/types/role.types';
import type { ScreenPermission } from 'src/modules/roles/types/role.types';

export class CreateRoleDto {
	/** Nome do cargo, único. */
	@ApiProperty({ example: 'Financeiro' })
	@IsString({ message: 'name deve ser um texto.' })
	@MinLength(2, { message: 'name deve ter no mínimo 2 caracteres.' })
	@MaxLength(50, { message: 'name deve ter no máximo 50 caracteres.' })
	name!: string;

	/** Para que serve o cargo. */
	@ApiPropertyOptional({ example: 'Acesso às telas de cobrança.' })
	@IsOptional()
	@IsString({ message: 'description deve ser um texto.' })
	@MaxLength(200, { message: 'description deve ter no máximo 200 caracteres.' })
	description?: string;

	/** Permissões do cargo, no formato `<tela>:<nível>`. */
	@ApiProperty({ example: ['admin.users:read'], enum: SCREEN_PERMISSIONS, isArray: true })
	@IsArray({ message: 'screens deve ser uma lista.' })
	@IsIn(SCREEN_PERMISSIONS, { each: true, message: 'screens contém uma permissão inexistente.' })
	screens!: ScreenPermission[];
}
