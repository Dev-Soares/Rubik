import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	Patch,
	Post,
	Put,
	Query,
	UseGuards,
} from '@nestjs/common';
import { ApiCreatedResponse, ApiNoContentResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import type { Paginated } from 'src/common/types/pagination.types';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { CreateRoleDto } from 'src/modules/roles/dto/create-role.dto';
import { SetUserScreensDto } from 'src/modules/roles/dto/set-user-screens.dto';
import { UpdateRoleDto } from 'src/modules/roles/dto/update-role.dto';
import { SCREENS } from 'src/modules/roles/types/role.types';
import type { PublicRole, Screen, UserScreens } from 'src/modules/roles/types/role.types';
import { RolesService } from 'src/modules/roles/roles.service';

@ApiTags('roles')
@Controller('roles')
@Roles('admin')
@UseGuards(RolesGuard)
export class RolesController {
	constructor(private readonly rolesService: RolesService) {}

	/** Telas que podem ser liberadas a um cargo. */
	@Get('screens')
	@ApiOkResponse({ description: 'Telas disponíveis.' })
	findScreens(): readonly Screen[] {
		return SCREENS;
	}

	/**
	 * Telas do próprio usuário. Fora do `@Roles('admin')` da classe: quem não é
	 * admin também precisa saber o que pode ver.
	 */
	@Get('me/screens')
	@Roles()
	@ApiOkResponse({ description: 'Telas do usuário da sessão.' })
	findMyScreens(
		@CurrentUser('id') id: string,
		@CurrentUser('role') role: string | null,
	): Promise<Screen[]> {
		return this.rolesService.findScreensForUser(id, role);
	}

	/**
	 * Visualização de um usuário: o que o cargo dá, as exceções pessoais e o
	 * efetivo. Antes de `:id` de propósito — senão `users` cairia no `findOne`.
	 */
	@Get('users/:userId/screens')
	@ApiOkResponse({ description: 'Visualização do usuário.' })
	findUserScreens(@Param('userId') userId: string): Promise<UserScreens> {
		return this.rolesService.findUserScreens(userId);
	}

	/** Substitui as exceções de tela do usuário. */
	@Put('users/:userId/screens')
	@ApiOkResponse({ description: 'Visualização atualizada.' })
	setUserScreens(
		@Param('userId') userId: string,
		@Body() body: SetUserScreensDto,
	): Promise<UserScreens> {
		return this.rolesService.setUserScreens(userId, body);
	}

	/** Lista cargos paginados. */
	@Get()
	@ApiOkResponse({ description: 'Lista paginada de cargos.' })
	findAll(@Query() pagination: PaginationDto): Promise<Paginated<PublicRole>> {
		return this.rolesService.findAll(pagination);
	}

	/** Busca um cargo. */
	@Get(':id')
	@ApiOkResponse({ description: 'Cargo encontrado.' })
	findOne(@Param('id') id: string): Promise<PublicRole> {
		return this.rolesService.findOne(id);
	}

	/** Cria um cargo. */
	@Post()
	@ApiCreatedResponse({ description: 'Cargo criado.' })
	create(@Body() body: CreateRoleDto): Promise<PublicRole> {
		return this.rolesService.create(body);
	}

	/** Atualiza um cargo. */
	@Patch(':id')
	@ApiOkResponse({ description: 'Cargo atualizado.' })
	update(@Param('id') id: string, @Body() body: UpdateRoleDto): Promise<PublicRole> {
		return this.rolesService.update(id, body);
	}

	/** Remove um cargo. */
	@Delete(':id')
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiNoContentResponse({ description: 'Cargo removido.' })
	remove(@Param('id') id: string): Promise<void> {
		return this.rolesService.remove(id);
	}
}
