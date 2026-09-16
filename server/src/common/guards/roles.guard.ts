import {
	type CanActivate,
	type ExecutionContext,
	ForbiddenException,
	Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from 'src/common/decorators/roles.decorator';
import type { OptionalAuthRequest } from 'src/common/types/req-types';

/** Roda depois do AuthGuard. Compara a role da sessão com as exigidas por `@Roles()`. */
@Injectable()
export class RolesGuard implements CanActivate {
	constructor(private readonly reflector: Reflector) {}

	canActivate(context: ExecutionContext): boolean {
		const required = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
			context.getHandler(),
			context.getClass(),
		]);

		if (!required?.length) {
			return true;
		}

		const request = context.switchToHttp().getRequest<OptionalAuthRequest>();
		const roles = request.user?.role?.split(',').map((role) => role.trim()) ?? [];

		if (!required.some((role) => roles.includes(role))) {
			throw new ForbiddenException('Permissão insuficiente.');
		}

		return true;
	}
}
