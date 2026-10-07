import { IsIn, IsOptional } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { USER_STATUSES } from 'src/modules/users/types/user.types';
import type { UserStatus } from 'src/modules/users/types/user.types';

export class QueryUsersDto extends PaginationDto {
	/** Filtra por conta ativa ou inativada. Ausente traz as duas. */
	@IsOptional()
	@IsIn(USER_STATUSES, { message: 'status deve ser ativo ou inativo.' })
	status?: UserStatus;
}
