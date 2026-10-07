import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import type { Paginated } from 'src/common/types/pagination.types';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { RequireAccess } from 'src/common/decorators/access.decorator';
import { OwnershipGuard } from 'src/common/guards/ownership.guard';
import { AccessGuard } from 'src/common/guards/access.guard';
import { QueryUsersDto } from 'src/modules/users/dto/query-users.dto';
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
	findAll(@Query() query: QueryUsersDto): Promise<Paginated<PublicUser>> {
		return this.usersService.findAll(query);
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

	/*
	 * NÃO existe rota de exclusão de usuário, e não é esquecimento.
	 *
	 * Conta se INATIVA (`banned`), nunca se apaga: a exclusão levava a perda
	 * permanente de controle do sistema. Bastava um cargo com `usuarios:apagar`
	 * — concedível pela tela de cargos a qualquer cargo — para apagar todos os
	 * administradores. A sessão deles morria no `ON DELETE cascade`, o cadastro
	 * público está desligado (`disableSignUp`), e não há rota de criação de
	 * usuário: o sistema ficava sem administrador, sem caminho de volta pela API.
	 *
	 * Inativar entrega o que a exclusão entregava de útil — encerra a sessão na
	 * hora e bloqueia novos logins — sem destruir o histórico: o `audit_log`
	 * continua apontando para um usuário que existe, e a conta pode ser
	 * reativada.
	 *
	 * Quem faz isso é o plugin admin do Better Auth, em `/auth/admin/ban-user` e
	 * `/auth/admin/unban-user`, que exige a role `admin` — não a permissão de
	 * tela. Daí não haver rota nossa para isso.
	 */
}
