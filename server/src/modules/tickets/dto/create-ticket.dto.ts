import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

/**
 * A requisição é `multipart/form-data`: aqui só o campo de texto. As fotos
 * chegam pelo `FilesInterceptor` e são validadas no controller, porque
 * `class-validator` não enxerga o corpo do arquivo.
 */
export class CreateTicketDto {
	@ApiProperty({ example: 'Impressora do setor não liga', maxLength: 120 })
	@IsString({ message: 'O título deve ser um texto.' })
	@MinLength(3, { message: 'O título deve ter no mínimo 3 caracteres.' })
	@MaxLength(120, { message: 'O título deve ter no máximo 120 caracteres.' })
	title!: string;
}
