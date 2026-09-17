import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

export class QueryNotificationsDto extends PaginationDto {
	/** Restringe às não lidas — é o que a aba "não lidas" da tela usa. */
	@ApiPropertyOptional({ description: 'Apenas notificações não lidas.' })
	@IsOptional()
	@Transform(({ value }) => value === true || value === 'true')
	@IsBoolean({ message: 'unreadOnly deve ser um booleano.' })
	unreadOnly?: boolean;

	/** Filtra pelo tipo do aviso. */
	@ApiPropertyOptional({ example: 'user.invited' })
	@IsOptional()
	@IsString({ message: 'kind deve ser um texto.' })
	@MaxLength(100, { message: 'kind deve ter no máximo 100 caracteres.' })
	kind?: string;
}
