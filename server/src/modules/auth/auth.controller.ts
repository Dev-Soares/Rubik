import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import type { User } from 'src/auth/types/auth.types';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

/**
 * Sign-in, sign-up e sign-out são servidos pelo handler do Better Auth em `/auth/*`,
 * montado como middleware no `main.ts` — aquele namespace inteiro pertence a ele.
 * Por isso este controller vive fora de `/auth`.
 */
@ApiTags('auth')
@Controller('me')
export class AuthController {
	/** Retorna o usuário da sessão atual. */
	@Get()
	@ApiOkResponse({ description: 'Usuário autenticado.' })
	me(@CurrentUser() user: User): User {
		return user;
	}
}
