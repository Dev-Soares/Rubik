import {
	type CanActivate,
	type ExecutionContext,
	ForbiddenException,
	Injectable,
} from '@nestjs/common';
import type { OptionalAuthRequest } from 'src/common/types/req-types';

const ADMIN_ROLE = 'admin';

/**
 * Permite acesso quando o `:id` da rota é o próprio usuário, ou quando ele é admin.
 * Usar em rotas do tipo `/users/:id`.
 */
@Injectable()
export class OwnershipGuard implements CanActivate {
	canActivate(context: ExecutionContext): boolean {
		const request = context.switchToHttp().getRequest<OptionalAuthRequest>();
		const user = request.user;

		if (!user) {
			throw new ForbiddenException('Permissão insuficiente.');
		}

		const roles = user.role?.split(',').map((role) => role.trim()) ?? [];
		if (roles.includes(ADMIN_ROLE)) {
			return true;
		}

		if (request.params.id !== user.id) {
			throw new ForbiddenException('Você só pode acessar seus próprios dados.');
		}

		return true;
	}
}
