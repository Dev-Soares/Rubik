import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsIn, ValidateNested } from 'class-validator';
import { SCREEN_PERMISSIONS } from 'src/modules/roles/types/role.types';
import type { ScreenPermission } from 'src/modules/roles/types/role.types';

export class ScreenOverrideDto {
	/** Permissão alvo da exceção, no formato `<tela>:<nível>`. */
	@ApiProperty({ example: 'admin.audit:read', enum: SCREEN_PERMISSIONS })
	@IsIn(SCREEN_PERMISSIONS, { message: 'screen não é uma permissão existente.' })
	screen!: ScreenPermission;

	/** `true` libera a permissão; `false` bloqueia, mesmo que o cargo libere. */
	@ApiProperty({ example: true })
	@IsBoolean({ message: 'allowed deve ser um booleano.' })
	allowed!: boolean;
}

export class SetUserScreensDto {
	/**
	 * Lista completa de exceções do usuário — substitui as atuais. Permissão fora
	 * da lista volta a herdar do cargo.
	 */
	@ApiProperty({ type: [ScreenOverrideDto] })
	@IsArray({ message: 'overrides deve ser uma lista.' })
	@ValidateNested({ each: true })
	@Type(() => ScreenOverrideDto)
	overrides!: ScreenOverrideDto[];
}
