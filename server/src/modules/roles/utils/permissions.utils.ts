import { ACCESS_DECLARATION, MODULES, PERMISSIONS } from 'src/modules/roles/types/role.types';
import type {
	Action,
	Module,
	Permission,
	PermissionOverride,
} from 'src/modules/roles/types/role.types';

export function isModule(value: string): value is Module {
	return (MODULES as readonly string[]).includes(value);
}

export function isPermission(value: string): value is Permission {
	return (PERMISSIONS as readonly string[]).includes(value);
}

export function toPermission(module: Module, action: Action): Permission {
	return `${module}:${action}` as Permission;
}

/** `'usuarios:editar'` → `{ module: 'usuarios', action: 'editar' }`. */
export function splitPermission(permission: Permission): { module: Module; action: Action } {
	const [module, action] = permission.split(':') as [Module, Action];
	return { module, action };
}

/** As ações que o módulo declara. */
export function actionsOf(module: Module): readonly Action[] {
	return ACCESS_DECLARATION[module];
}

/**
 * Quem faz qualquer coisa no módulo também o enxerga: criar sem ver seria um
 * estado impossível de usar, e deixá-lo passar obrigaria cada guard a checar
 * duas permissões.
 */
export function expandView(permissions: readonly Permission[]): Permission[] {
	const result = new Set<Permission>(permissions);

	for (const permission of permissions) {
		const { module } = splitPermission(permission);
		result.add(toPermission(module, 'ver'));
	}

	return PERMISSIONS.filter((permission) => result.has(permission));
}

/** `role.permissions` é uma coluna de texto separada por vírgula. */
export function parsePermissions(permissions: string | null | undefined): Permission[] {
	const parsed =
		permissions
			?.split(',')
			.map((permission) => permission.trim())
			.filter(isPermission) ?? [];

	return expandView(parsed);
}

/**
 * Resolve a visualização efetiva: `(herdadas ∪ liberadas) \ bloqueadas`.
 * A exceção pessoal vence o cargo — é o topo da hierarquia.
 *
 * Bloquear `ver` derruba o módulo inteiro: o que não se enxerga não se edita.
 */
export function applyPermissionOverrides(
	inherited: readonly Permission[],
	overrides: readonly PermissionOverride[],
): Permission[] {
	const permissions = new Set(inherited);

	for (const override of overrides) {
		if (override.allowed) {
			permissions.add(override.permission);
			continue;
		}

		permissions.delete(override.permission);

		const { module, action } = splitPermission(override.permission);
		if (action === 'ver') {
			for (const other of actionsOf(module)) {
				permissions.delete(toPermission(module, other));
			}
		}
	}

	return expandView([...permissions]);
}

/** Última exceção de cada permissão vence — a PK composta não aceita duplicata. */
export function dedupePermissionOverrides(
	overrides: readonly PermissionOverride[],
): PermissionOverride[] {
	const byPermission = new Map<Permission, PermissionOverride>();

	for (const override of overrides) {
		byPermission.set(override.permission, override);
	}

	return [...byPermission.values()];
}
