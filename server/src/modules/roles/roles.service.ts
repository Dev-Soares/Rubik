import {
	ConflictException,
	ForbiddenException,
	Inject,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { and, count, eq, inArray, isNotNull, ne } from 'drizzle-orm';
import { DB } from 'src/db/db.provider';
import type { Database } from 'src/db/types/db.types';
import { user } from 'src/db/schema/auth';
import { role } from 'src/db/schema/role';
import type { PaginationDto } from 'src/common/dto/pagination.dto';
import type { Paginated } from 'src/common/types/pagination.types';
import { ADMIN_ROLE, isAdmin, toRoleNames } from 'src/common/utils';
import { userPermissionOverride } from 'src/db/schema/userPermissionOverride';
import type { CreateRoleDto } from 'src/modules/roles/dto/create-role.dto';
import type { SetUserPermissionsDto } from 'src/modules/roles/dto/set-user-permissions.dto';
import type { UpdateRoleDto } from 'src/modules/roles/dto/update-role.dto';
import { PERMISSIONS } from 'src/modules/roles/types/role.types';
import type {
	Permission,
	PermissionOverride,
	PublicRole,
	RoleColor,
	RoleIcon,
	UserPermissions,
} from 'src/modules/roles/types/role.types';
import {
	applyPermissionOverrides,
	dedupePermissionOverrides,
	expandView,
	isPermission,
	parsePermissions,
} from 'src/modules/roles/utils';

type RoleRow = typeof role.$inferSelect;

function toPublicRole(row: RoleRow): PublicRole {
	return {
		id: row.id,
		name: row.name,
		description: row.description,
		permissions: parsePermissions(row.permissions),
		color: row.color as RoleColor,
		icon: row.icon as RoleIcon,
		isSystem: row.isSystem,
		createdAt: row.createdAt,
		updatedAt: row.updatedAt,
	};
}

@Injectable()
export class RolesService {
	constructor(@Inject(DB) private readonly db: Database) {}

	/**
	 * Permissões que o usuário tem de fato: união dos cargos, com as exceções
	 * pessoais aplicadas por cima. Admin recebe tudo, sem exceção — bloquear um
	 * admin trancaria o próprio painel de permissões.
	 */
	async findPermissionsForUser(userId: string, roleNames: string | null): Promise<Permission[]> {
		if (isAdmin(roleNames)) {
			return [...PERMISSIONS];
		}

		const [inherited, overrides] = await Promise.all([
			this.findInheritedPermissions(roleNames),
			this.findOverridesForUser(userId),
		]);

		return applyPermissionOverrides(inherited, overrides);
	}

	/**
	 * Visualização de um usuário, para o painel de administração: o que o cargo
	 * dá, as exceções pessoais e o resultado.
	 */
	async findUserPermissions(userId: string): Promise<UserPermissions> {
		const target = await this.findUserOrFail(userId);

		const [inherited, overrides] = await Promise.all([
			this.findInheritedPermissions(target.role),
			this.findOverridesForUser(userId),
		]);

		return {
			inherited,
			overrides,
			effective: isAdmin(target.role)
				? [...PERMISSIONS]
				: applyPermissionOverrides(inherited, overrides),
		};
	}

	/**
	 * Substitui as exceções do usuário pela lista recebida. Exceção redundante
	 * (concorda com o cargo) é descartada: o override existe para divergir, e
	 * guardá-la congelaria a tela se o cargo mudasse depois.
	 */
	async setUserPermissions(userId: string, data: SetUserPermissionsDto): Promise<UserPermissions> {
		const target = await this.findUserOrFail(userId);

		if (isAdmin(target.role)) {
			throw new ForbiddenException('Administrador tem acesso total ao sistema.');
		}

		const inherited = new Set(await this.findInheritedPermissions(target.role));
		const divergent = dedupePermissionOverrides(data.overrides).filter(
			(override) => override.allowed !== inherited.has(override.permission),
		);

		await this.db.transaction(async (tx) => {
			await tx.delete(userPermissionOverride).where(eq(userPermissionOverride.userId, userId));

			if (divergent.length > 0) {
				await tx.insert(userPermissionOverride).values(
					divergent.map((override) => ({
						userId,
						permission: override.permission,
						allowed: override.allowed,
					})),
				);
			}
		});

		return this.findUserPermissions(userId);
	}

	/** União das permissões dos cargos. `user.role` guarda nomes separados por vírgula. */
	private async findInheritedPermissions(roleNames: string | null): Promise<Permission[]> {
		const names = toRoleNames(roleNames);

		if (names.length === 0) {
			return [];
		}

		const rows = await this.db
			.select({ permissions: role.permissions })
			.from(role)
			.where(inArray(role.name, names));

		const permissions = new Set<Permission>();
		for (const row of rows) {
			for (const permission of parsePermissions(row.permissions)) {
				permissions.add(permission);
			}
		}

		return expandView([...permissions]);
	}

	private async findOverridesForUser(userId: string): Promise<PermissionOverride[]> {
		const rows = await this.db
			.select({
				permission: userPermissionOverride.permission,
				allowed: userPermissionOverride.allowed,
			})
			.from(userPermissionOverride)
			.where(eq(userPermissionOverride.userId, userId));

		// Permissão removida de `PERMISSIONS` pode ter sobrado no banco: ignore.
		return rows
			.filter((row): row is PermissionOverride => isPermission(row.permission))
			.map((row) => ({ permission: row.permission, allowed: row.allowed }));
	}

	private async findUserOrFail(userId: string): Promise<{ role: string | null }> {
		const [found] = await this.db
			.select({ role: user.role })
			.from(user)
			.where(eq(user.id, userId))
			.limit(1);

		if (!found) {
			throw new NotFoundException('Usuário não encontrado.');
		}

		return found;
	}

	async findAll(pagination: PaginationDto): Promise<Paginated<PublicRole>> {
		const [rows, [totals]] = await Promise.all([
			this.db.select().from(role).limit(pagination.limit).offset(pagination.offset),
			this.db.select({ value: count() }).from(role),
		]);

		return {
			items: rows.map(toPublicRole),
			total: totals?.value ?? 0,
			limit: pagination.limit,
			offset: pagination.offset,
		};
	}

	async findOne(id: string): Promise<PublicRole> {
		const [found] = await this.db.select().from(role).where(eq(role.id, id)).limit(1);

		if (!found) {
			throw new NotFoundException('Cargo não encontrado.');
		}

		return toPublicRole(found);
	}

	async create(data: CreateRoleDto): Promise<PublicRole> {
		await this.assertNameIsFree(data.name);

		const [created] = await this.db
			.insert(role)
			.values({
				id: randomUUID(),
				name: data.name,
				description: data.description ?? null,
				permissions: data.permissions.join(','),
				color: data.color,
				icon: data.icon,
			})
			.returning();

		if (!created) {
			throw new ConflictException('Não foi possível criar o cargo.');
		}

		return toPublicRole(created);
	}

	async update(id: string, data: UpdateRoleDto): Promise<PublicRole> {
		const current = await this.findOne(id);

		/*
		 * Quem tem `user.role = 'admin'` recebe todas as permissões em
		 * `findPermissionsForUser`, sem consultar cargo nem exceção. Editar este
		 * cargo não mudaria nada — bloquear é mais honesto que aceitar em silêncio.
		 */
		if (current.name === ADMIN_ROLE) {
			throw new ForbiddenException('O cargo de administrador tem acesso total e não é editável.');
		}

		// Cargo de sistema sustenta as regras do RolesGuard: renomear quebraria o acesso.
		if (current.isSystem && data.name && data.name !== current.name) {
			throw new ForbiddenException('Cargo de sistema não pode ser renomeado.');
		}

		if (data.name && data.name !== current.name) {
			await this.assertNameIsFree(data.name, id);
		}

		/*
		 * `!== undefined` em todos os campos, e não `data.campo ?`: o que decide é
		 * o campo ter sido enviado, não o valor ser truthy. `permissions: []` é
		 * uma lista vazia válida — "este cargo não libera nada" — e com `?` o
		 * caso funcionava por acidente, já que `[]` é truthy. Hoje os validadores
		 * do DTO barram `''` em `name`, `color` e `icon`, mas a regra não pode
		 * depender disso: afrouxar um `@MinLength` passaria a descartar o campo
		 * em silêncio.
		 */
		const values = {
			...(data.name !== undefined ? { name: data.name } : {}),
			...(data.description !== undefined ? { description: data.description } : {}),
			...(data.permissions !== undefined ? { permissions: data.permissions.join(',') } : {}),
			...(data.color !== undefined ? { color: data.color } : {}),
			...(data.icon !== undefined ? { icon: data.icon } : {}),
		};

		// PATCH sem nenhum campo é requisição sem mudança. O Drizzle recusaria
		// `.set({})` com um `Error` cru, que o filtro global viraria 500.
		if (Object.keys(values).length === 0) {
			return current;
		}

		const [updated] = await this.db.update(role).set(values).where(eq(role.id, id)).returning();

		if (!updated) {
			throw new NotFoundException('Cargo não encontrado.');
		}

		return toPublicRole(updated);
	}

	async remove(id: string): Promise<void> {
		const current = await this.findOne(id);

		if (current.isSystem) {
			throw new ForbiddenException('Cargo de sistema não pode ser removido.');
		}

		/*
		 * `role` é CSV, então `eq(user.role, name)` só encontra quem tem esse
		 * cargo e mais nenhum: quem tinha `editor,viewer` passava pela checagem e
		 * ficava apontando para um cargo inexistente — perdendo permissões em
		 * silêncio, porque `findInheritedPermissions` simplesmente não acha a
		 * linha. Filtrar em memória é o mesmo caminho de `findAdminIds`, e por
		 * isso: em SQL exigiria `like` com os quatro casos de borda do CSV
		 * (sozinho, primeiro, meio, último).
		 */
		const holders = await this.db
			.select({ role: user.role })
			.from(user)
			.where(isNotNull(user.role));

		if (holders.some((row) => toRoleNames(row.role).includes(current.name))) {
			throw new ConflictException('Cargo em uso por um ou mais usuários.');
		}

		await this.db.delete(role).where(eq(role.id, id));
	}

	/** Nome é único: o índice garante, mas o erro precisa ser em pt-BR. */
	private async assertNameIsFree(name: string, exceptId?: string): Promise<void> {
		const [existing] = await this.db
			.select({ id: role.id })
			.from(role)
			.where(exceptId ? and(eq(role.name, name), ne(role.id, exceptId)) : eq(role.name, name))
			.limit(1);

		if (existing) {
			throw new ConflictException('Já existe um cargo com esse nome.');
		}
	}
}
