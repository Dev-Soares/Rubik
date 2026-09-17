import {
	SCREENS,
	type AccessByScreen,
	type GrantByScreen,
	type Screen,
	type ScreenAccess,
	type ScreenGrant,
	type ScreenLevel,
	type ScreenOverride,
	type ScreenPermission,
	type UserScreens,
} from '@/modules/roles/types/role';

export function toPermission(screen: Screen, level: ScreenLevel): ScreenPermission {
	return `${screen}:${level}`;
}

/** O maior nível concedido a uma tela dentro de uma lista de permissões. */
export function toGrant(permissions: readonly ScreenPermission[], screen: Screen): ScreenGrant {
	if (permissions.includes(toPermission(screen, 'write'))) {
		return 'write';
	}

	return permissions.includes(toPermission(screen, 'read')) ? 'read' : 'none';
}

/** Permissões do cargo viram um nível por tela, para os selects do formulário. */
export function toGrantByScreen(permissions: readonly ScreenPermission[]): GrantByScreen {
	return Object.fromEntries(
		SCREENS.map((screen) => [screen, toGrant(permissions, screen)]),
	) as GrantByScreen;
}

/** `write` sempre acompanha `read`: quem edita também enxerga. */
export function toPermissions(grants: GrantByScreen): ScreenPermission[] {
	return SCREENS.flatMap((screen) => {
		if (grants[screen] === 'none') {
			return [];
		}

		return grants[screen] === 'write'
			? [toPermission(screen, 'read'), toPermission(screen, 'write')]
			: [toPermission(screen, 'read')];
	});
}

/** Exceção salva vira o nível pedido; tela sem exceção fica em `inherit`. */
export function toAccessByScreen(screens: UserScreens): AccessByScreen {
	const allowed = new Set(
		screens.overrides.filter((item) => item.allowed).map((item) => item.screen),
	);
	const denied = new Set(
		screens.overrides.filter((item) => !item.allowed).map((item) => item.screen),
	);

	return Object.fromEntries(
		SCREENS.map((screen): [Screen, ScreenAccess] => {
			const read = toPermission(screen, 'read');
			const write = toPermission(screen, 'write');

			if (!allowed.has(read) && !allowed.has(write) && !denied.has(read) && !denied.has(write)) {
				return [screen, 'inherit'];
			}

			if (denied.has(read)) {
				return [screen, 'none'];
			}

			return [screen, allowed.has(write) ? 'write' : 'read'];
		}),
	) as AccessByScreen;
}

/**
 * Traduz a escolha por tela em exceções nas duas permissões. Só o que diverge do
 * cargo é enviado — o backend descarta exceção redundante de qualquer forma,
 * mas mandar menos deixa o payload legível.
 */
export function toScreenOverrides(
	access: AccessByScreen,
	inherited: readonly ScreenPermission[],
): ScreenOverride[] {
	return SCREENS.flatMap((screen): ScreenOverride[] => {
		const choice = access[screen];

		if (choice === 'inherit') {
			return [];
		}

		const wanted: Record<Exclude<ScreenAccess, 'inherit'>, Record<ScreenLevel, boolean>> = {
			none: { read: false, write: false },
			read: { read: true, write: false },
			write: { read: true, write: true },
		};

		return (['read', 'write'] as const)
			.map((level) => ({
				screen: toPermission(screen, level),
				allowed: wanted[choice][level],
			}))
			.filter((override) => override.allowed !== inherited.includes(override.screen));
	});
}
