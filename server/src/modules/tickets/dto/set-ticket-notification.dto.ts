import { IsBoolean } from 'class-validator';

export class SetTicketNotificationDto {
	@IsBoolean({ message: 'enabled deve ser verdadeiro ou falso.' })
	enabled!: boolean;
}
