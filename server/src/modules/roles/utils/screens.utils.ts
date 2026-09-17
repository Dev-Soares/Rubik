import { SCREEN_PERMISSIONS, SCREENS } from 'src/modules/roles/types/role.types';
import type {
	Screen,
	ScreenLevel,
	ScreenOverride,
	ScreenPermission,
} from 'src/modules/roles/types/role.types';

export function isScreen(value: string): value is Screen {
	return (SCREENS as readonly string[]).includes(value);
}

export function isScreenPermission(value: string): value is ScreenPermission {
	return (SCREEN_PERMISSIONS as readonly string[]).includes(value);
}

export function toPermission(screen: Screen, level: ScreenLevel): ScreenPermission {
	return `${screen}:${level}`;
}

/** `'admin.users:write'` → `{ screen: 'admin.users', level: 'write' }`. */
export function splitPermission(permission: ScreenPermission): {
	screen: Screen;
	level: ScreenLevel;
} {
	const [screen, level] = permission.split(':') as [Screen, ScreenLevel];
	return { screen, level };
}

/**
 * Aceita a forma antiga sem nível (`'admin.users'`), tratando-a como leitura.
 * Cargo gravado antes do nível existir continua valendo sem SQL manual.
 */
function normalizePermission(value: string): ScreenPermission | null {
	if (isScreenPermission(value)) {
		return value;
	}

	return isScreen(value) ? toPermission(value, 'read') : null;
}

/** `role.screens` é uma coluna de texto separada por vírgula. */
export function parseScreens(screens: string | null | undefined): ScreenPermission[] {
	const parsed =
		screens
			?.split(',')
			.map((screen) => screen.trim())
			.map(normalizePermission)
			.filter((permission): permission is ScreenPermission => permission !== null) ?? [];

	return expandWrite(parsed);
}

/**
 * Quem edita também enxerga: `write` sem `read` seria um estado impossível de
 * usar, e deixá-lo passar obrigaria cada guard a checar os dois níveis.
 */
export function expandWrite(permissions: readonly ScreenPermission[]): ScreenPermission[] {
	const result = new Set<ScreenPermission>(permissions);

	for (const permission of permissions) {
		const { screen, level } = splitPermission(permission);
		if (level === 'write') {
			result.add(toPermission(screen, 'read'));
		}
	}

	return SCREEN_PERMISSIONS.filter((permission) => result.has(permission));
}

/**
 * Resolve a visualização efetiva: `(herdadas ∪ liberadas) \ bloqueadas`.
 * A exceção pessoal vence o cargo — é o topo da hierarquia.
 *
 * Bloquear `read` derruba o `write` junto: tela invisível não pode ser editada.
 */
export function applyScreenOverrides(
	inherited: readonly ScreenPermission[],
	overrides: readonly ScreenOverride[],
): ScreenPermission[] {
	const permissions = new Set(inherited);

	for (const override of overrides) {
		if (override.allowed) {
			permissions.add(override.screen);
			continue;
		}

		permissions.delete(override.screen);

		const { screen, level } = splitPermission(override.screen);
		if (level === 'read') {
			permissions.delete(toPermission(screen, 'write'));
		}
	}

	return expandWrite([...permissions]);
}

/** Última exceção de cada permissão vence — a PK composta não aceita duplicata. */
export function dedupeScreenOverrides(overrides: readonly ScreenOverride[]): ScreenOverride[] {
	const byScreen = new Map<ScreenPermission, ScreenOverride>();

	for (const override of overrides) {
		byScreen.set(override.screen, override);
	}

	return [...byScreen.values()];
}
