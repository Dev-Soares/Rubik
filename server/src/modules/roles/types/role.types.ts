/**
 * Telas que um cargo pode liberar. A chave é o contrato com o frontend:
 * mudou aqui, muda em `client/src/shared/navigation.ts`.
 */
export const SCREENS = ['admin.users', 'admin.roles', 'admin.audit'] as const;

export type Screen = (typeof SCREENS)[number];

export type PublicRole = {
	id: string;
	name: string;
	description: string | null;
	screens: Screen[];
	isSystem: boolean;
	createdAt: Date;
	updatedAt: Date;
};

/**
 * Exceção de tela por usuário. `allowed: true` libera uma tela que o cargo não
 * dá; `false` bloqueia uma que ele dá. Tela ausente herda do cargo.
 */
export type ScreenOverride = {
	screen: Screen;
	allowed: boolean;
};

/** Visualização de um usuário: o que o cargo dá, as exceções e o efetivo. */
export type UserScreens = {
	/** União das telas dos cargos do usuário, antes das exceções. */
	inherited: Screen[];
	overrides: ScreenOverride[];
	/** `(inherited ∪ grants) \ denies` — o que o usuário enxerga de fato. */
	effective: Screen[];
};
