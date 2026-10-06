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
import { PaginationDto } from 'src/common/dto/pagination.dto';
import type { Paginated } from 'src/common/types/pagination.types';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { AnyAccess, RequireAccess } from 'src/common/decorators/access.decorator';
import { AccessGuard } from 'src/common/guards/access.guard';
import { CreateRoleDto } from 'src/modules/roles/dto/create-role.dto';
import { SetUserPermissionsDto } from 'src/modules/roles/dto/set-user-permissions.dto';
import { UpdateRoleDto } from 'src/modules/roles/dto/update-role.dto';
import { ACCESS_DECLARATION } from 'src/modules/roles/types/role.types';
import type { Permission, PublicRole, UserPermissions } from 'src/modules/roles/types/role.types';
import { RolesService } from 'src/modules/roles/roles.service';

@Controller('roles')
@RequireAccess('cargos', 'ver')
@UseGuards(AccessGuard)
export class RolesController {
	constructor(private readonly rolesService: RolesService) {}

	/**
	 * Os módulos do sistema e as ações de cada um — o que a tela de cargos
	 * desenha como tabela.
	 */
	@Get('modules')
	findModules(): typeof ACCESS_DECLARATION {
		return ACCESS_DECLARATION;
	}

	/**
	 * Permissões do próprio usuário. Sem `@RequireAccess` de propósito: todo
	 * usuário precisa saber o que pode acessar, inclusive quem não tem módulo
	 * nenhum — é o que monta a sidebar.
	 */
	@Get('me/permissions')
	@AnyAccess()
	findMyPermissions(
		@CurrentUser('id') id: string,
		@CurrentUser('role') role: string | null,
	): Promise<Permission[]> {
		return this.rolesService.findPermissionsForUser(id, role);
	}

	/**
	 * Visualização de um usuário: o que o cargo dá, as exceções pessoais e o
	 * efetivo. Antes de `:id` de propósito — senão `users` cairia no `findOne`.
	 *
	 * Mora em `usuarios`: quem administra usuários mexe nas exceções deles.
	 */
	@Get('users/:userId/permissions')
	@RequireAccess('usuarios', 'ver')
	findUserPermissions(@Param('userId') userId: string): Promise<UserPermissions> {
		return this.rolesService.findUserPermissions(userId);
	}

	/** Substitui as exceções de permissão do usuário. */
	@Put('users/:userId/permissions')
	@RequireAccess('usuarios', 'editar')
	setUserPermissions(
		@Param('userId') userId: string,
		@Body() body: SetUserPermissionsDto,
	): Promise<UserPermissions> {
		return this.rolesService.setUserPermissions(userId, body);
	}

	/** Lista cargos paginados. */
	@Get()
	findAll(@Query() pagination: PaginationDto): Promise<Paginated<PublicRole>> {
		return this.rolesService.findAll(pagination);
	}

	/** Busca um cargo. */
	@Get(':id')
	findOne(@Param('id') id: string): Promise<PublicRole> {
		return this.rolesService.findOne(id);
	}

	/** Cria um cargo. */
	@Post()
	@RequireAccess('cargos', 'criar')
	create(@Body() body: CreateRoleDto): Promise<PublicRole> {
		return this.rolesService.create(body);
	}

	/** Atualiza um cargo. */
	@Patch(':id')
	@RequireAccess('cargos', 'editar')
	update(@Param('id') id: string, @Body() body: UpdateRoleDto): Promise<PublicRole> {
		return this.rolesService.update(id, body);
	}

	/** Remove um cargo. */
	@Delete(':id')
	@RequireAccess('cargos', 'apagar')
	@HttpCode(HttpStatus.NO_CONTENT)
	remove(@Param('id') id: string): Promise<void> {
		return this.rolesService.remove(id);
	}
}
