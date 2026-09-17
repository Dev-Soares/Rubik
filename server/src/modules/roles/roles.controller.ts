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
import { AnyScreen, RequireScreen } from 'src/common/decorators/screen.decorator';
import { ScreensGuard } from 'src/common/guards/screens.guard';
import { CreateRoleDto } from 'src/modules/roles/dto/create-role.dto';
import { SetUserScreensDto } from 'src/modules/roles/dto/set-user-screens.dto';
import { UpdateRoleDto } from 'src/modules/roles/dto/update-role.dto';
import { SCREEN_PERMISSIONS } from 'src/modules/roles/types/role.types';
import type { PublicRole, ScreenPermission, UserScreens } from 'src/modules/roles/types/role.types';
import { RolesService } from 'src/modules/roles/roles.service';

@ApiTags('roles')
@Controller('roles')
@RequireScreen('admin.roles', 'read')
@UseGuards(ScreensGuard)
export class RolesController {
	constructor(private readonly rolesService: RolesService) {}

	/** Permissões que podem ser atribuídas a um cargo. */
	@Get('screens')
	@ApiOkResponse({ description: 'Permissões disponíveis.' })
	findScreens(): readonly ScreenPermission[] {
		return SCREEN_PERMISSIONS;
	}

	/**
	 * Permissões do próprio usuário. Sem `@RequireScreen` de propósito: todo
	 * usuário precisa saber o que pode acessar, inclusive quem não tem tela
	 * nenhuma — é o que monta a sidebar.
	 */
	@Get('me/screens')
	@AnyScreen()
	@ApiOkResponse({ description: 'Permissões do usuário da sessão.' })
	findMyScreens(
		@CurrentUser('id') id: string,
		@CurrentUser('role') role: string | null,
	): Promise<ScreenPermission[]> {
		return this.rolesService.findScreensForUser(id, role);
	}

	/**
	 * Visualização de um usuário: o que o cargo dá, as exceções pessoais e o
	 * efetivo. Antes de `:id` de propósito — senão `users` cairia no `findOne`.
	 *
	 * Mora em `admin.users`: quem administra usuários mexe nas exceções deles.
	 */
	@Get('users/:userId/screens')
	@RequireScreen('admin.users', 'read')
	@ApiOkResponse({ description: 'Visualização do usuário.' })
	findUserScreens(@Param('userId') userId: string): Promise<UserScreens> {
		return this.rolesService.findUserScreens(userId);
	}

	/** Substitui as exceções de permissão do usuário. */
	@Put('users/:userId/screens')
	@RequireScreen('admin.users', 'write')
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
	@RequireScreen('admin.roles', 'write')
	@ApiCreatedResponse({ description: 'Cargo criado.' })
	create(@Body() body: CreateRoleDto): Promise<PublicRole> {
		return this.rolesService.create(body);
	}

	/** Atualiza um cargo. */
	@Patch(':id')
	@RequireScreen('admin.roles', 'write')
	@ApiOkResponse({ description: 'Cargo atualizado.' })
	update(@Param('id') id: string, @Body() body: UpdateRoleDto): Promise<PublicRole> {
		return this.rolesService.update(id, body);
	}

	/** Remove um cargo. */
	@Delete(':id')
	@RequireScreen('admin.roles', 'write')
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiNoContentResponse({ description: 'Cargo removido.' })
	remove(@Param('id') id: string): Promise<void> {
		return this.rolesService.remove(id);
	}
}
