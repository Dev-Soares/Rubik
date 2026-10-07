import { IsArray, IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { PERMISSIONS, ROLE_COLORS, ROLE_ICONS } from 'src/modules/roles/types/role.types';
import type { Permission, RoleColor, RoleIcon } from 'src/modules/roles/types/role.types';

export class UpdateRoleDto {
	/** Nome do cargo, único. */
	@IsOptional()
	@IsString({ message: 'name deve ser um texto.' })
	@MinLength(2, { message: 'name deve ter no mínimo 2 caracteres.' })
	@MaxLength(50, { message: 'name deve ter no máximo 50 caracteres.' })
	name?: string;

	/** Para que serve o cargo. */
	@IsOptional()
	@IsString({ message: 'description deve ser um texto.' })
	@MaxLength(200, { message: 'description deve ter no máximo 200 caracteres.' })
	description?: string;

	/** Permissões do cargo, no formato `<módulo>:<ação>`. */
	@IsOptional()
	@IsArray({ message: 'permissions deve ser uma lista.' })
	@IsIn(PERMISSIONS, { each: true, message: 'permissions contém uma permissão inexistente.' })
	permissions?: Permission[];

	/** Cor do crachá. */
	@IsOptional()
	@IsIn(ROLE_COLORS, { message: 'color não é uma cor existente.' })
	color?: RoleColor;

	/** Ícone do crachá. */
	@IsOptional()
	@IsIn(ROLE_ICONS, { message: 'icon não é um ícone existente.' })
	icon?: RoleIcon;
}
