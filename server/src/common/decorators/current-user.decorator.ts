import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { User } from 'src/modules/auth/types/auth.types';
import type { OptionalAuthRequest } from 'src/common/types/req-types';

/**
 * Injeta o usuário da sessão no handler.
 * `@CurrentUser()` retorna o usuário inteiro; `@CurrentUser('id')` retorna um campo.
 */
export const CurrentUser = createParamDecorator(
	(field: keyof User | undefined, context: ExecutionContext) => {
		const request = context.switchToHttp().getRequest<OptionalAuthRequest>();
		if (!request.user) {
			return undefined;
		}
		return field ? request.user[field] : request.user;
	},
);
