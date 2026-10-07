import { Controller, Get } from '@nestjs/common';
import type { User } from 'src/modules/auth/types/auth.types';
import type { PublicUser } from 'src/modules/users/types/user.types';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

/**
 * Sign-in, sign-up e sign-out são servidos pelo handler do Better Auth em `/auth/*`,
 * montado como middleware no `main.ts` — aquele namespace inteiro pertence a ele.
 * Por isso este controller responde em `/me`, fora do path `/auth`.
 */
@Controller('me')
export class AuthController {
	/**
	 * Usuário da sessão atual, em campos explícitos.
	 *
	 * Não devolve o objeto do Better Auth cru: o tipo dele é inferido da config
	 * (`Auth['$Infer']['Session']['user']`), então o plugin admin já acrescenta
	 * `banReason` e `banExpires` ali, e qualquer `additionalFields` novo entraria
	 * nesta resposta sem ninguém decidir. Listar os campos é o que mantém a
	 * decisão no código — o mesmo motivo do `publicColumns` em `users.service`.
	 *
	 * `PublicUser` é o mesmo contrato que `/users` devolve: a tela mostra a
	 * própria conta pelos mesmos campos que mostra as outras, e um tipo novo
	 * aqui seria duplicata da mesma regra.
	 */
	@Get()
	me(@CurrentUser() user: User): PublicUser {
		return {
			id: user.id,
			name: user.name,
			email: user.email,
			emailVerified: user.emailVerified,
			image: user.image ?? null,
			role: user.role ?? null,
			banned: user.banned ?? null,
			createdAt: user.createdAt,
			updatedAt: user.updatedAt,
		};
	}
}
