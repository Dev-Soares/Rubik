import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsIn, ValidateNested } from 'class-validator';
import { PERMISSIONS } from 'src/modules/roles/types/role.types';
import type { Permission } from 'src/modules/roles/types/role.types';

export class PermissionOverrideDto {
	/** Permissão alvo da exceção, no formato `<módulo>:<ação>`. */
	@IsIn(PERMISSIONS, { message: 'permission não é uma permissão existente.' })
	permission!: Permission;

	/** `true` libera a permissão; `false` bloqueia, mesmo que o cargo libere. */
	@IsBoolean({ message: 'allowed deve ser um booleano.' })
	allowed!: boolean;
}

export class SetUserPermissionsDto {
	/**
	 * Lista completa de exceções do usuário — substitui as atuais. Permissão fora
	 * da lista volta a herdar do cargo.
	 */
	@IsArray({ message: 'overrides deve ser uma lista.' })
	@ValidateNested({ each: true })
	@Type(() => PermissionOverrideDto)
	overrides!: PermissionOverrideDto[];
}
