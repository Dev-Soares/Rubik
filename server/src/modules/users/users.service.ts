import {
	BadRequestException,
	ForbiddenException,
	Inject,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { count, desc, eq, inArray } from 'drizzle-orm';
import { DB } from 'src/db/db.provider';
import type { Database } from 'src/db/types/db.types';
import { user } from 'src/db/schema/auth';
import { role } from 'src/db/schema/role';
import type { Paginated } from 'src/common/types/pagination.types';
import { isAdmin, toRoleNames } from 'src/common/utils';
import { RolesService } from 'src/modules/roles/roles.service';
import type { QueryUsersDto } from 'src/modules/users/dto/query-users.dto';
import type { UpdateUserDto } from 'src/modules/users/dto/update-user.dto';
import type { Editor } from 'src/common/types/editor.types';
import type { PublicUser } from 'src/modules/users/types/user.types';
import { toBannedFilter } from 'src/modules/users/utils';

const publicColumns = {
	id: user.id,
	name: user.name,
	email: user.email,
	emailVerified: user.emailVerified,
	image: user.image,
	role: user.role,
	banned: user.banned,
	createdAt: user.createdAt,
	updatedAt: user.updatedAt,
} as const;

@Injectable()
export class UsersService {
	constructor(
		@Inject(DB) private readonly db: Database,
		private readonly rolesService: RolesService,
	) {}

	async findAll(query: QueryUsersDto): Promise<Paginated<PublicUser>> {
		// `banned` é nulo nas contas criadas antes do campo: ativo é "não banido".
		const where = query.status ? toBannedFilter(query.status) : undefined;

		const [items, [totals]] = await Promise.all([
			// Ordem estável: sem ORDER BY o Postgres não garante ordem, e `user`
			// recebe UPDATE em todo PATCH e em todo login (`updatedAt`) — a linha
			// muda de posição física e a paginação repete/omite registros.
			this.db
				.select(publicColumns)
				.from(user)
				.where(where)
				.orderBy(desc(user.createdAt), desc(user.id))
				.limit(query.limit)
				.offset(query.offset),
			this.db.select({ value: count() }).from(user).where(where),
		]);

		return {
			items,
			total: totals?.value ?? 0,
			limit: query.limit,
			offset: query.offset,
		};
	}

	async findOne(id: string): Promise<PublicUser> {
		const [found] = await this.db.select(publicColumns).from(user).where(eq(user.id, id)).limit(1);

		if (!found) {
			throw new NotFoundException('Usuário não encontrado.');
		}

		return found;
	}

	/**
	 * `editor` é quem fez a chamada: o cargo só muda para quem administra
	 * usuários, senão qualquer um se promoveria pela própria tela de perfil.
	 */
	async update(id: string, data: UpdateUserDto, editor: Editor): Promise<PublicUser> {
		if (data.role !== undefined) {
			await this.assertCanSetRole(id, data.role, editor);
		}

		/*
		 * Todo campo do DTO é opcional, então `{}` passa pela validação e chega
		 * aqui. O Drizzle recusa `.set({})` com um `Error` cru ("No values to
		 * set"), que não é `HttpException` — o filtro global devolvia 500 e
		 * disparava alerta de erro para um PATCH sem efeito. PATCH sem campo é
		 * requisição sem mudança: devolve o estado atual.
		 */
		if (Object.keys(data).length === 0) {
			return this.findOne(id);
		}

		const [updated] = await this.db
			.update(user)
			.set(data)
			.where(eq(user.id, id))
			.returning(publicColumns);

		if (!updated) {
			throw new NotFoundException('Usuário não encontrado.');
		}

		return updated;
	}

	/** Cargo precisa existir e vir de quem administra usuários. */
	private async assertCanSetRole(
		targetId: string,
		roleNames: string,
		editor: Editor,
	): Promise<void> {
		const permissions = await this.rolesService.findPermissionsForUser(editor.id, editor.role);

		if (!permissions.includes('usuarios:editar')) {
			throw new ForbiddenException('Você não pode alterar o cargo de um usuário.');
		}

		// Trocar o próprio cargo é o caminho mais curto para se trancar fora.
		if (targetId === editor.id) {
			throw new ForbiddenException('Você não pode alterar o seu próprio cargo.');
		}

		const names = toRoleNames(roleNames);

		if (names.length === 0) {
			throw new BadRequestException('Informe ao menos um cargo.');
		}

		const existing = await this.db
			.select({ name: role.name, isSystem: role.isSystem })
			.from(role)
			.where(inArray(role.name, names));

		if (existing.length !== names.length) {
			throw new BadRequestException('Cargo inexistente.');
		}

		/*
		 * Conceder cargo de sistema exige ser administrador.
		 *
		 * `admin` é uma linha da tabela `role` como qualquer outra, então passava
		 * na checagem de existência acima: quem tinha `usuarios:editar` promovia
		 * um terceiro a administrador, e esse terceiro passa a receber TODAS as
		 * permissões em `findPermissionsForUser`, mais as rotas `/auth/admin/*`
		 * do Better Auth (criar usuário, definir senha de qualquer um, inativar).
		 * Com uma segunda conta sob controle, era acesso total.
		 *
		 * As outras operações de administrador do sistema já exigem a role
		 * `admin` e não a permissão de tela; esta é a mesma regra.
		 */
		if (!isAdmin(editor.role) && existing.some((found) => found.isSystem)) {
			throw new ForbiddenException('Só um administrador concede cargo de sistema.');
		}

		/*
		 * Revogar cargo de sistema de quem é administrador segue a mesma regra:
		 * sem isto, `usuarios:editar` rebaixava todos os administradores — o
		 * mesmo lockout que a remoção de conta abria, por outra porta.
		 */
		const target = await this.findUserRoleOrFail(targetId);

		if (!isAdmin(editor.role) && isAdmin(target.role)) {
			throw new ForbiddenException('Só um administrador altera o cargo de outro administrador.');
		}
	}

	/** Cargo atual do alvo, para as regras que comparam editor e editado. */
	private async findUserRoleOrFail(id: string): Promise<{ role: string | null }> {
		const [found] = await this.db
			.select({ role: user.role })
			.from(user)
			.where(eq(user.id, id))
			.limit(1);

		if (!found) {
			throw new NotFoundException('Usuário não encontrado.');
		}

		return found;
	}
}
