import {
	SCREENS,
	type AccessByScreen,
	type ScreenOverride,
	type UserScreens,
} from '@/modules/roles/types/role';

/** Exceção salva vira `allow`/`deny`; tela sem exceção fica em `inherit`. */
export function toAccessByScreen(screens: UserScreens): AccessByScreen {
	const overrides = new Map(screens.overrides.map((item) => [item.screen, item.allowed]));

	return Object.fromEntries(
		SCREENS.map((screen) => {
			const allowed = overrides.get(screen);
			return [screen, allowed === undefined ? 'inherit' : allowed ? 'allow' : 'deny'];
		}),
	) as AccessByScreen;
}

/** Só as telas que divergem do cargo viram exceção; `inherit` não é enviado. */
export function toScreenOverrides(access: AccessByScreen): ScreenOverride[] {
	return SCREENS.filter((screen) => access[screen] !== 'inherit').map((screen) => ({
		screen,
		allowed: access[screen] === 'allow',
	}));
}
