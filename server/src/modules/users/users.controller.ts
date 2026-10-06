import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	Patch,
	Query,
	UseGuards,
} from '@nestjs/common';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import type { Paginated } from 'src/common/types/pagination.types';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { RequireAccess } from 'src/common/decorators/access.decorator';
import { OwnershipGuard } from 'src/common/guards/ownership.guard';
import { AccessGuard } from 'src/common/guards/access.guard';
import { UpdateUserDto } from 'src/modules/users/dto/update-user.dto';
import type { PublicUser } from 'src/modules/users/types/user.types';
import { UsersService } from 'src/modules/users/users.service';

@Controller('users')
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	/** Lista usuários paginados. Requer ver o módulo de usuários. */
	@Get()
	@RequireAccess('usuarios', 'ver')
	@UseGuards(AccessGuard)
	findAll(@Query() pagination: PaginationDto): Promise<Paginated<PublicUser>> {
		return this.usersService.findAll(pagination);
	}

	/** Busca um usuário. Só o próprio usuário ou um admin. */
	@Get(':id')
	@UseGuards(OwnershipGuard)
	findOne(@Param('id') id: string): Promise<PublicUser> {
		return this.usersService.findOne(id);
	}

	/**
	 * Atualiza um usuário. Só o próprio usuário ou um admin — e o campo `role`
	 * ainda exige `usuarios:editar`, resolvido no service.
	 */
	@Patch(':id')
	@UseGuards(OwnershipGuard)
	update(
		@Param('id') id: string,
		@Body() body: UpdateUserDto,
		@CurrentUser('id') editorId: string,
		@CurrentUser('role') editorRole: string | null,
	): Promise<PublicUser> {
		return this.usersService.update(id, body, { id: editorId, role: editorRole });
	}

	/** Remove um usuário. Requer a ação de apagar no módulo de usuários. */
	@Delete(':id')
	@RequireAccess('usuarios', 'apagar')
	@UseGuards(AccessGuard)
	@HttpCode(HttpStatus.NO_CONTENT)
	remove(@Param('id') id: string): Promise<void> {
		return this.usersService.remove(id);
	}
}
