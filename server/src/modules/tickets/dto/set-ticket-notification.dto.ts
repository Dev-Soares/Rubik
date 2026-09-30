import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class SetTicketNotificationDto {
	@ApiProperty({ description: 'Receber avisos de chamado no sino.' })
	@IsBoolean({ message: 'enabled deve ser verdadeiro ou falso.' })
	enabled!: boolean;
}
