import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl, MaxLength, MinLength } from 'class-validator';

export class UpdateUserDto {
	/** Nome de exibição do usuário. */
	@ApiPropertyOptional({ example: 'Maria Silva' })
	@IsOptional()
	@IsString({ message: 'name deve ser um texto.' })
	@MinLength(2, { message: 'name deve ter no mínimo 2 caracteres.' })
	@MaxLength(100, { message: 'name deve ter no máximo 100 caracteres.' })
	name?: string;

	/** URL do avatar. */
	@ApiPropertyOptional({ example: 'https://exemplo.com/avatar.png' })
	@IsOptional()
	@IsUrl({}, { message: 'image deve ser uma URL válida.' })
	image?: string;
}
