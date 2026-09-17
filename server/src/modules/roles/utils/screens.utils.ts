import { SCREENS } from 'src/modules/roles/types/role.types';
import type { Screen, ScreenOverride } from 'src/modules/roles/types/role.types';

export function isScreen(value: string): value is Screen {
	return (SCREENS as readonly string[]).includes(value);
}

/** `role.screens` é uma coluna de texto separada por vírgula. */
export function parseScreens(screens: string | null | undefined): Screen[] {
	return (
		screens
			?.split(',')
			.map((screen) => screen.trim())
			.filter(isScreen) ?? []
	);
}

/**
 * Resolve a visualização efetiva: `(herdadas ∪ liberadas) \ bloqueadas`.
 * A exceção pessoal vence o cargo — é o topo da hierarquia.
 */
export function applyScreenOverrides(
	inherited: readonly Screen[],
	overrides: readonly ScreenOverride[],
): Screen[] {
	const screens = new Set(inherited);

	for (const override of overrides) {
		if (override.allowed) {
			screens.add(override.screen);
		} else {
			screens.delete(override.screen);
		}
	}

	return [...screens];
}

/** Última exceção de cada tela vence — a PK composta não aceita duplicata. */
export function dedupeScreenOverrides(overrides: readonly ScreenOverride[]): ScreenOverride[] {
	const byScreen = new Map<Screen, ScreenOverride>();

	for (const override of overrides) {
		byScreen.set(override.screen, override);
	}

	return [...byScreen.values()];
}
