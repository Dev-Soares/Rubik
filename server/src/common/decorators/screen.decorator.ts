import { SetMetadata } from '@nestjs/common';
import type { Screen, ScreenLevel } from 'src/modules/roles/types/role.types';

export const SCREEN_KEY = 'screen';

export type ScreenRequirement = {
	screen: Screen;
	level: ScreenLevel;
};

/**
 * Exige que o usuário tenha a permissão da tela no nível pedido. Usar junto do
 * `ScreensGuard`. Rota que altera dado pede `write`; rota de consulta, `read`.
 */
export const RequireScreen = (screen: Screen, level: ScreenLevel) =>
	SetMetadata(SCREEN_KEY, { screen, level } satisfies ScreenRequirement);

/**
 * Dispensa a exigência da classe numa rota específica — a sessão ainda é
 * obrigatória pelo `AuthGuard`. Para o que todo usuário autenticado precisa
 * acessar, como as próprias permissões.
 */
export const AnyScreen = () => SetMetadata(SCREEN_KEY, null);
