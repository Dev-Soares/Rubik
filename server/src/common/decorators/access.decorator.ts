import { SetMetadata } from '@nestjs/common';
import type { Action, Module } from 'src/modules/roles/types/role.types';

export const ACCESS_KEY = 'access';

export type AccessRequirement = {
	module: Module;
	action: Action;
};

/**
 * Exige que o usuário possa a ação no módulo. Usar junto do `AccessGuard`.
 * A ação é a do vocabulário do módulo em `ACCESS_DECLARATION`: rota de consulta
 * pede `ver`; rota que altera dado pede `criar`, `editar` ou `apagar`.
 */
export const RequireAccess = <M extends Module>(module: M, action: Action<M>) =>
	SetMetadata(ACCESS_KEY, { module, action } satisfies AccessRequirement);

/**
 * Dispensa a exigência da classe numa rota específica — a sessão ainda é
 * obrigatória pelo `AuthGuard`. Para o que todo usuário autenticado precisa
 * acessar, como as próprias permissões.
 */
export const AnyAccess = () => SetMetadata(ACCESS_KEY, null);
