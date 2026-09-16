import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { count, eq } from 'drizzle-orm';
import { DB } from 'src/db/db.provider';
import type { Database } from 'src/db/types/db.types';
import { user } from 'src/db/schema/auth';
import type { PaginationDto } from 'src/common/dto/pagination.dto';
import type { Paginated } from 'src/common/types/pagination.types';
import type { UpdateUserDto } from 'src/modules/users/dto/update-user.dto';
import type { PublicUser } from 'src/modules/users/types/user.types';

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
	constructor(@Inject(DB) private readonly db: Database) {}

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

	async update(id: string, data: UpdateUserDto): Promise<PublicUser> {
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

	async remove(id: string): Promise<void> {
		const [deleted] = await this.db.delete(user).where(eq(user.id, id)).returning({ id: user.id });

		if (!deleted) {
			throw new NotFoundException('Usuário não encontrado.');
		}
	}
}
