/**
 * Telas que um cargo pode liberar. A chave é o contrato com o frontend:
 * mudou aqui, muda em `client/src/shared/navigation.ts`.
 */
export const SCREENS = ['admin.users', 'admin.roles', 'admin.audit'] as const;

export type Screen = (typeof SCREENS)[number];

/** `read` abre a tela; `write` permite alterar o que há nela. */
export const SCREEN_LEVELS = ['read', 'write'] as const;

export type ScreenLevel = (typeof SCREEN_LEVELS)[number];

/**
 * Permissão concreta, no formato `<tela>:<nível>` — é assim que ela viaja no
 * CSV de `role.screens`, na coluna `user_screen_override.screen` e na API.
 */
export type ScreenPermission = `${Screen}:${ScreenLevel}`;

/** Todas as combinações existentes, na ordem das telas. */
export const SCREEN_PERMISSIONS: ScreenPermission[] = SCREENS.flatMap((screen) =>
	SCREEN_LEVELS.map((level): ScreenPermission => `${screen}:${level}`),
);

export type PublicRole = {
	id: string;
	name: string;
	description: string | null;
	screens: ScreenPermission[];
	isSystem: boolean;
	createdAt: Date;
	updatedAt: Date;
};

/**
 * Exceção de permissão por usuário. `allowed: true` libera uma permissão que o
 * cargo não dá; `false` bloqueia uma que ele dá. Ausente herda do cargo.
 */
export type ScreenOverride = {
	screen: ScreenPermission;
	allowed: boolean;
};

/** Visualização de um usuário: o que o cargo dá, as exceções e o efetivo. */
export type UserScreens = {
	/** União das permissões dos cargos do usuário, antes das exceções. */
	inherited: ScreenPermission[];
	overrides: ScreenOverride[];
	/** `(inherited ∪ grants) \ denies`, com `write` implicando `read`. */
	effective: ScreenPermission[];
};
