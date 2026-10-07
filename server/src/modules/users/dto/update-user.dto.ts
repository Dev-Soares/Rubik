import { IsOptional, IsString, IsUrl, MaxLength, MinLength } from 'class-validator';

export class UpdateUserDto {
	/** Nome de exibição do usuário. */
	@IsOptional()
	@IsString({ message: 'name deve ser um texto.' })
	@MinLength(2, { message: 'name deve ter no mínimo 2 caracteres.' })
	@MaxLength(100, { message: 'name deve ter no máximo 100 caracteres.' })
	name?: string;

	/** URL do avatar. */
	@IsOptional()
	@IsUrl({}, { message: 'image deve ser uma URL válida.' })
	image?: string;

	/**
	 * Cargos do usuário, separados por vírgula — é como o Better Auth grava. Exige
	 * `usuarios:editar`: o dono da conta editando o próprio perfil não muda os
	 * próprios cargos. O limite comporta vários nomes de até 50 caracteres.
	 */
	@IsOptional()
	@IsString({ message: 'role deve ser um texto.' })
	@MinLength(1, { message: 'role não pode ser vazio.' })
	@MaxLength(500, { message: 'role deve ter no máximo 500 caracteres.' })
	role?: string;
}
