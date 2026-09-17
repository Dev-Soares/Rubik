import {
	type CallHandler,
	type ExecutionContext,
	Injectable,
	type NestInterceptor,
} from '@nestjs/common';
import type { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import type { OptionalAuthRequest } from 'src/common/types/req-types';
import { AuditService } from 'src/modules/audit/audit.service';
import type { AuditAction } from 'src/modules/audit/types/audit.types';

/** Só mutação vira registro: GET/HEAD/OPTIONS ficam de fora. */
const ACTION_BY_METHOD: Record<string, AuditAction> = {
	POST: 'create',
	PATCH: 'update',
	PUT: 'update',
	DELETE: 'delete',
};

/**
 * Registro de uso. Roda depois do `AuthGuard`, então `request.user` já existe.
 * Só grava quando o handler completa sem erro — tentativa que falhou não é
 * movimentação.
 *
 * O corpo da requisição não é lido: o log guarda apenas quem, o quê e sobre
 * qual recurso, sem risco de persistir senha ou dado sensível.
 */
@Injectable()
export class AuditInterceptor implements NestInterceptor {
	constructor(private readonly auditService: AuditService) {}

	intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
		if (context.getType() !== 'http') {
			return next.handle();
		}

		const request = context.switchToHttp().getRequest<OptionalAuthRequest>();
		const action = ACTION_BY_METHOD[request.method];
		const user = request.user;

		// Sem sessão não há autor a registrar (rota pública, ou login pelo Better Auth).
		if (!action || !user) {
			return next.handle();
		}

		const entity = request.path.split('/').filter(Boolean)[0] ?? 'desconhecido';
		const entityId = typeof request.params.id === 'string' ? request.params.id : null;

		return next.handle().pipe(
			tap(() => {
				void this.auditService.record({
					userId: user.id,
					userName: user.name,
					userEmail: user.email,
					action,
					entity,
					entityId,
					method: request.method,
					path: request.path,
					ipAddress: request.ip ?? null,
				});
			}),
		);
	}
}
