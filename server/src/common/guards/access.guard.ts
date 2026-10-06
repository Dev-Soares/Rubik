import {
	type CanActivate,
	type ExecutionContext,
	ForbiddenException,
	Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ACCESS_KEY } from 'src/common/decorators/access.decorator';
import type { AccessRequirement } from 'src/common/decorators/access.decorator';
import type { OptionalAuthRequest } from 'src/common/types/req-types';
import { RolesService } from 'src/modules/roles/roles.service';
import { toPermission } from 'src/modules/roles/utils';

/**
 * Roda depois do AuthGuard. Compara as permissões efetivas do usuário — cargo
 * mais exceções pessoais — com a exigida por `@RequireAccess()`.
 *
 * É a autorização de verdade: o filtro da sidebar é só UX.
 */
@Injectable()
export class AccessGuard implements CanActivate {
	constructor(
		private readonly reflector: Reflector,
		private readonly rolesService: RolesService,
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		// `@AnyAccess()` grava `null` no handler e sobrescreve a exigência da classe.
		const required = this.reflector.getAllAndOverride<AccessRequirement | null | undefined>(
			ACCESS_KEY,
			[context.getHandler(), context.getClass()],
		);

		if (!required) {
			return true;
		}

		const request = context.switchToHttp().getRequest<OptionalAuthRequest>();
		const user = request.user;

		if (!user) {
			throw new ForbiddenException('Permissão insuficiente.');
		}

		const permissions = await this.rolesService.findPermissionsForUser(user.id, user.role ?? null);

		if (!permissions.includes(toPermission(required.module, required.action))) {
			throw new ForbiddenException('Permissão insuficiente.');
		}

		return true;
	}
}
