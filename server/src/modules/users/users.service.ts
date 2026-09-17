import {
	BadRequestException,
	ForbiddenException,
	Inject,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { count, eq, inArray } from 'drizzle-orm';
import { DB } from 'src/db/db.provider';
import type { Database } from 'src/db/types/db.types';
import { user } from 'src/db/schema/auth';
import { role } from 'src/db/schema/role';
import type { PaginationDto } from 'src/common/dto/pagination.dto';
import type { Paginated } from 'src/common/types/pagination.types';
import { toRoleNames } from 'src/common/utils';
import { RolesService } from 'src/modules/roles/roles.service';
import type { UpdateUserDto } from 'src/modules/users/dto/update-user.dto';
import type { Editor, PublicUser } from 'src/modules/users/types/user.types';

const publicColumns = {
	id: user.id,
	name: user.name,
	email: user.email,
	emailVerified: user.emailVerified,
	image: user.image,
	role: user.role,
	createdAt: user.createdAt,
	updatedAt: user.updatedAt,
} as const;

@Injectable()
export class UsersService {
	constructor(
		@Inject(DB) private readonly db: Database,
		private readonly rolesService: RolesService,
	) {}

	async findAll(pagination: PaginationDto): Promise<Paginated<PublicUser>> {
		const [items, [totals]] = await Promise.all([
			this.db.select(publicColumns).from(user).limit(pagination.limit).offset(pagination.offset),
			this.db.select({ value: count() }).from(user),
		]);

		return {
			items,
			total: totals?.value ?? 0,
			limit: pagination.limit,
			offset: pagination.offset,
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
		const screens = await this.rolesService.findScreensForUser(editor.id, editor.role);

		if (!screens.includes('admin.users:write')) {
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
			.select({ name: role.name })
			.from(role)
			.where(inArray(role.name, names));

		if (existing.length !== names.length) {
			throw new BadRequestException('Cargo inexistente.');
		}
	}

	async remove(id: string): Promise<void> {
		const [deleted] = await this.db.delete(user).where(eq(user.id, id)).returning({ id: user.id });

		if (!deleted) {
			throw new NotFoundException('Usuário não encontrado.');
		}
	}
}
