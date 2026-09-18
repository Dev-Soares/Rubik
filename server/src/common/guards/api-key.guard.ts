import {
	type CanActivate,
	type ExecutionContext,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { secretMatches } from 'src/common/utils';
import { env } from 'src/config/env';

/**
 * Autentica serviço externo pelo header `x-api-key`. Use junto de `@Public()`:
 * a rota não tem sessão de usuário, e sem isso o `AuthGuard` global a recusaria
 * antes deste guard rodar.
 */
@Injectable()
export class ApiKeyGuard implements CanActivate {
	canActivate(context: ExecutionContext): boolean {
		const request = context.switchToHttp().getRequest<Request>();
		const provided = request.header('x-api-key');

		if (!provided || !secretMatches(provided, env.INTEGRATION_API_KEY)) {
			throw new UnauthorizedException('Chave de integração inválida.');
		}

		return true;
	}
}
