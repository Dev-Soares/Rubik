import {
	ACCESS_DECLARATION,
	MODULES,
	type AccessByPermission,
	type Action,
	type ActionAccess,
	type Module,
	type Permission,
	type PermissionOverride,
	type UserPermissions,
} from '@/modules/roles/types/role';

export function toPermission(module: Module, action: Action): Permission {
	return `${module}:${action}` as Permission;
}

/** As ações que o módulo declara. */
export function actionsOf(module: Module): readonly Action[] {
	return ACCESS_DECLARATION[module];
}

/**
 * Liga ou desliga uma ação do cargo.
 *
 * Marcar qualquer ação marca `ver` junto, e desmarcar `ver` desmarca o módulo
 * inteiro: editar sem enxergar é um estado que o backend corrige sozinho
 * (`expandView`), e deixá-lo aparecer na tela confundiria quem configura.
 */
export function togglePermission(
	permissions: readonly Permission[],
	module: Module,
	action: Action,
): Permission[] {
	const current = new Set(permissions);
	const target = toPermission(module, action);

	if (current.has(target)) {
		current.delete(target);

		if (action === 'ver') {
			for (const other of actionsOf(module)) {
				current.delete(toPermission(module, other));
			}
		}
	} else {
		current.add(target);
		current.add(toPermission(module, 'ver'));
	}

	return [...current];
}

/** Quantas ações do módulo o cargo tem — o resumo da linha. */
export function countGranted(permissions: readonly Permission[], module: Module): number {
	return actionsOf(module).filter((action) => permissions.includes(toPermission(module, action)))
		.length;
}

/** Exceção salva vira a escolha da tela; permissão sem exceção fica em `herda`. */
export function toAccessByPermission(permissions: UserPermissions): AccessByPermission {
	const byPermission = new Map(
		permissions.overrides.map((override) => [override.permission, override.allowed]),
	);

	return Object.fromEntries(
		MODULES.flatMap((module) =>
			actionsOf(module).map((action): [Permission, ActionAccess] => {
				const permission = toPermission(module, action);
				const override = byPermission.get(permission);

				if (override === undefined) {
					return [permission, 'herda'];
				}

				return [permission, override ? 'libera' : 'bloqueia'];
			}),
		),
	) as AccessByPermission;
}

/**
 * Traduz as escolhas da tela em exceções. Só o que diverge do cargo é enviado —
 * o backend descarta exceção redundante de qualquer forma, mas mandar menos
 * deixa o payload legível.
 */
export function toPermissionOverrides(
	access: AccessByPermission,
	inherited: readonly Permission[],
): PermissionOverride[] {
	return Object.entries(access).flatMap(([key, choice]): PermissionOverride[] => {
		if (choice === 'herda') {
			return [];
		}

		const permission = key as Permission;
		const allowed = choice === 'libera';

		return allowed === inherited.includes(permission) ? [] : [{ permission, allowed }];
	});
}
