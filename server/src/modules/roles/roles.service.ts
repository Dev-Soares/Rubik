import {
	ConflictException,
	ForbiddenException,
	Inject,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { and, count, eq, inArray, ne } from 'drizzle-orm';
import { DB } from 'src/db/db.provider';
import type { Database } from 'src/db/types/db.types';
import { user } from 'src/db/schema/auth';
import { role } from 'src/db/schema/role';
import type { PaginationDto } from 'src/common/dto/pagination.dto';
import type { Paginated } from 'src/common/types/pagination.types';
import { isAdmin, toRoleNames } from 'src/common/utils';
import { userScreenOverride } from 'src/db/schema/userScreenOverride';
import type { CreateRoleDto } from 'src/modules/roles/dto/create-role.dto';
import type { SetUserScreensDto } from 'src/modules/roles/dto/set-user-screens.dto';
import type { UpdateRoleDto } from 'src/modules/roles/dto/update-role.dto';
import { SCREENS } from 'src/modules/roles/types/role.types';
import type {
	PublicRole,
	Screen,
	ScreenOverride,
	UserScreens,
} from 'src/modules/roles/types/role.types';
import {
	applyScreenOverrides,
	dedupeScreenOverrides,
	isScreen,
	parseScreens,
} from 'src/modules/roles/utils';

type RoleRow = typeof role.$inferSelect;

function toPublicRole(row: RoleRow): PublicRole {
	return {
		id: row.id,
		name: row.name,
		description: row.description,
		screens: parseScreens(row.screens),
		isSystem: row.isSystem,
		createdAt: row.createdAt,
		updatedAt: row.updatedAt,
	};
}

@Injectable()
export class RolesService {
	constructor(@Inject(DB) private readonly db: Database) {}

	/**
	 * Telas que o usuário enxerga de fato: união dos cargos, com as exceções
	 * pessoais aplicadas por cima. Admin enxerga tudo, sem exceção — bloquear um
	 * admin trancaria o próprio painel de permissões.
	 */
	async findScreensForUser(userId: string, roleNames: string | null): Promise<Screen[]> {
		if (isAdmin(roleNames)) {
			return [...SCREENS];
		}

		const [inherited, overrides] = await Promise.all([
			this.findInheritedScreens(roleNames),
			this.findOverridesForUser(userId),
		]);

		return applyScreenOverrides(inherited, overrides);
	}

	/**
	 * Visualização de um usuário, para o painel de administração: o que o cargo
	 * dá, as exceções pessoais e o resultado.
	 */
	async findUserScreens(userId: string): Promise<UserScreens> {
		const target = await this.findUserOrFail(userId);

		const [inherited, overrides] = await Promise.all([
			this.findInheritedScreens(target.role),
			this.findOverridesForUser(userId),
		]);

		return {
			inherited,
			overrides,
			effective: isAdmin(target.role) ? [...SCREENS] : applyScreenOverrides(inherited, overrides),
		};
	}

	/**
	 * Substitui as exceções do usuário pela lista recebida. Exceção redundante
	 * (concorda com o cargo) é descartada: o override existe para divergir, e
	 * guardá-la congelaria a tela se o cargo mudasse depois.
	 */
	async setUserScreens(userId: string, data: SetUserScreensDto): Promise<UserScreens> {
		const target = await this.findUserOrFail(userId);

		if (isAdmin(target.role)) {
			throw new ForbiddenException('Administrador enxerga todas as telas.');
		}

		const inherited = new Set(await this.findInheritedScreens(target.role));
		const divergent = dedupeScreenOverrides(data.overrides).filter(
			(override) => override.allowed !== inherited.has(override.screen),
		);

		await this.db.transaction(async (tx) => {
			await tx.delete(userScreenOverride).where(eq(userScreenOverride.userId, userId));

			if (divergent.length > 0) {
				await tx.insert(userScreenOverride).values(
					divergent.map((override) => ({
						userId,
						screen: override.screen,
						allowed: override.allowed,
					})),
				);
			}
		});

		return this.findUserScreens(userId);
	}

	/** União das telas dos cargos. `user.role` guarda nomes separados por vírgula. */
	private async findInheritedScreens(roleNames: string | null): Promise<Screen[]> {
		const names = toRoleNames(roleNames);

		if (names.length === 0) {
			return [];
		}

		const rows = await this.db
			.select({ screens: role.screens })
			.from(role)
			.where(inArray(role.name, names));

		const screens = new Set<Screen>();
		for (const row of rows) {
			for (const screen of parseScreens(row.screens)) {
				screens.add(screen);
			}
		}

		return [...screens];
	}

	private async findOverridesForUser(userId: string): Promise<ScreenOverride[]> {
		const rows = await this.db
			.select({ screen: userScreenOverride.screen, allowed: userScreenOverride.allowed })
			.from(userScreenOverride)
			.where(eq(userScreenOverride.userId, userId));

		// Tela removida de `SCREENS` pode ter sobrado no banco: ignore.
		return rows
			.filter((row): row is ScreenOverride => isScreen(row.screen))
			.map((row) => ({ screen: row.screen, allowed: row.allowed }));
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
				screens: data.screens.join(','),
			})
			.returning();

		if (!created) {
			throw new ConflictException('Não foi possível criar o cargo.');
		}

		return toPublicRole(created);
	}

	async update(id: string, data: UpdateRoleDto): Promise<PublicRole> {
		const current = await this.findOne(id);

		// Cargo de sistema sustenta as regras do RolesGuard: renomear quebraria o acesso.
		if (current.isSystem && data.name && data.name !== current.name) {
			throw new ForbiddenException('Cargo de sistema não pode ser renomeado.');
		}

		if (data.name && data.name !== current.name) {
			await this.assertNameIsFree(data.name, id);
		}

		const [updated] = await this.db
			.update(role)
			.set({
				...(data.name ? { name: data.name } : {}),
				...(data.description === undefined ? {} : { description: data.description }),
				...(data.screens ? { screens: data.screens.join(',') } : {}),
			})
			.where(eq(role.id, id))
			.returning();

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

		const [inUse] = await this.db
			.select({ value: count() })
			.from(user)
			.where(eq(user.role, current.name));

		if ((inUse?.value ?? 0) > 0) {
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
