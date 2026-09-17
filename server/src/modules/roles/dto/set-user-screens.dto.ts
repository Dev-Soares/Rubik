import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsIn, ValidateNested } from 'class-validator';
import { SCREENS } from 'src/modules/roles/types/role.types';
import type { Screen } from 'src/modules/roles/types/role.types';

export class ScreenOverrideDto {
	/** Tela alvo da exceção. */
	@ApiProperty({ example: 'admin.audit', enum: SCREENS })
	@IsIn(SCREENS, { message: 'screen não é uma tela existente.' })
	screen!: Screen;

	/** `true` libera a tela; `false` bloqueia, mesmo que o cargo libere. */
	@ApiProperty({ example: true })
	@IsBoolean({ message: 'allowed deve ser um booleano.' })
	allowed!: boolean;
}

export class SetUserScreensDto {
	/**
	 * Lista completa de exceções do usuário — substitui as atuais. Tela fora da
	 * lista volta a herdar do cargo.
	 */
	@ApiProperty({ type: [ScreenOverrideDto] })
	@IsArray({ message: 'overrides deve ser uma lista.' })
	@ValidateNested({ each: true })
	@Type(() => ScreenOverrideDto)
	overrides!: ScreenOverrideDto[];
}
