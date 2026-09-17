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
import { ApiNoContentResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import type { Paginated } from 'src/common/types/pagination.types';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { RequireScreen } from 'src/common/decorators/screen.decorator';
import { OwnershipGuard } from 'src/common/guards/ownership.guard';
import { ScreensGuard } from 'src/common/guards/screens.guard';
import { UpdateUserDto } from 'src/modules/users/dto/update-user.dto';
import type { PublicUser } from 'src/modules/users/types/user.types';
import { UsersService } from 'src/modules/users/users.service';

@ApiTags('users')
@Controller('users')
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	/** Lista usuários paginados. Requer leitura da tela de usuários. */
	@Get()
	@RequireScreen('admin.users', 'read')
	@UseGuards(ScreensGuard)
	@ApiOkResponse({ description: 'Lista paginada de usuários.' })
	findAll(@Query() pagination: PaginationDto): Promise<Paginated<PublicUser>> {
		return this.usersService.findAll(pagination);
	}

	/** Busca um usuário. Só o próprio usuário ou um admin. */
	@Get(':id')
	@UseGuards(OwnershipGuard)
	@ApiOkResponse({ description: 'Usuário encontrado.' })
	findOne(@Param('id') id: string): Promise<PublicUser> {
		return this.usersService.findOne(id);
	}

	/**
	 * Atualiza um usuário. Só o próprio usuário ou um admin — e o campo `role`
	 * ainda exige `admin.users:write`, resolvido no service.
	 */
	@Patch(':id')
	@UseGuards(OwnershipGuard)
	@ApiOkResponse({ description: 'Usuário atualizado.' })
	update(
		@Param('id') id: string,
		@Body() body: UpdateUserDto,
		@CurrentUser('id') editorId: string,
		@CurrentUser('role') editorRole: string | null,
	): Promise<PublicUser> {
		return this.usersService.update(id, body, { id: editorId, role: editorRole });
	}

	/** Remove um usuário. Requer edição da tela de usuários. */
	@Delete(':id')
	@RequireScreen('admin.users', 'write')
	@UseGuards(ScreensGuard)
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiNoContentResponse({ description: 'Usuário removido.' })
	remove(@Param('id') id: string): Promise<void> {
		return this.usersService.remove(id);
	}
}
