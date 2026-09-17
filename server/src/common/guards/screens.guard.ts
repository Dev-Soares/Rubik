import {
	type CanActivate,
	type ExecutionContext,
	ForbiddenException,
	Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SCREEN_KEY } from 'src/common/decorators/screen.decorator';
import type { ScreenRequirement } from 'src/common/decorators/screen.decorator';
import type { OptionalAuthRequest } from 'src/common/types/req-types';
import { RolesService } from 'src/modules/roles/roles.service';
import { toPermission } from 'src/modules/roles/utils';

/**
 * Roda depois do AuthGuard. Compara as permissões efetivas do usuário — cargo
 * mais exceções pessoais — com a exigida por `@RequireScreen()`.
 *
 * É a autorização de verdade: o filtro da sidebar é só UX.
 */
@Injectable()
export class ScreensGuard implements CanActivate {
	constructor(
		private readonly reflector: Reflector,
		private readonly rolesService: RolesService,
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		// `@AnyScreen()` grava `null` no handler e sobrescreve a exigência da classe.
		const required = this.reflector.getAllAndOverride<ScreenRequirement | null | undefined>(
			SCREEN_KEY,
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

		const screens = await this.rolesService.findScreensForUser(user.id, user.role ?? null);

		if (!screens.includes(toPermission(required.screen, required.level))) {
			throw new ForbiddenException('Permissão insuficiente.');
		}

		return true;
	}
}
