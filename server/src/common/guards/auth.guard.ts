import {
	type CanActivate,
	type ExecutionContext,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { fromNodeHeaders } from 'better-auth/node';
import { auth } from 'src/modules/auth/auth';
import { IS_PUBLIC_KEY } from 'src/common/decorators/public.decorator';
import type { OptionalAuthRequest } from 'src/common/types/req-types';

/**
 * Guard global. Resolve a sessão do Better Auth pelo cookie httpOnly
 * e anexa `user`/`session` na request. Rotas marcadas com `@Public()` passam direto.
 */
@Injectable()
export class AuthGuard implements CanActivate {
	constructor(private readonly reflector: Reflector) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
			context.getHandler(),
			context.getClass(),
		]);

		const request = context.switchToHttp().getRequest<OptionalAuthRequest>();

		const result = await auth.api.getSession({
			headers: fromNodeHeaders(request.headers),
		});

		if (result) {
			request.user = result.user;
			request.session = result.session;
		}

		if (isPublic) {
			return true;
		}

		if (!result) {
			throw new UnauthorizedException('Não autenticado.');
		}

		return true;
	}
}
